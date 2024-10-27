import unittest
import torch
from torch_geometric.data import Data
from recommendation.models.GNN_model import CourseRecommendationGNN  # Replace with your actual module name

class TestCourseRecommendationGNN(unittest.TestCase):

    def setUp(self):
        # Set parameters for the GNN
        self.input_dim = 10
        self.hidden_dim = 5
        self.output_dim = 3
        self.model = CourseRecommendationGNN(self.input_dim, self.hidden_dim, self.output_dim)

        # Create dummy data for testing
        self.num_nodes = 4
        self.num_edges = 4
        x = torch.randn((self.num_nodes, self.input_dim))  # Random node features
        edge_index = torch.tensor([[0, 1, 1, 2],
                                    [1, 0, 2, 1]], dtype=torch.long)  # Simple edge index

        self.data = Data(x=x, edge_index=edge_index)

    def test_model_initialization(self):
        """Test if the model initializes with the correct input dimensions."""
        self.assertEqual(self.model.conv1.in_channels, self.input_dim)
        self.assertEqual(self.model.conv1.out_channels, self.hidden_dim)
        self.assertEqual(self.model.conv2.in_channels, self.hidden_dim)
        self.assertEqual(self.model.conv2.out_channels, self.output_dim)
        self.assertEqual(self.model.fc.in_features, self.output_dim * 2)  # Concatenated embeddings

    def test_forward_pass(self):
        """Test the forward pass of the model."""
        output = self.model(self.data)
        self.assertEqual(output.size(0), self.num_nodes)  # Output should match the number of nodes
        self.assertEqual(output.size(1), self.output_dim)  # Output should match the output dimension

    def test_predict_edges(self):
        """Test the edge prediction functionality."""
        # Forward pass to get embeddings
        embeddings = self.model(self.data)

        # Create dummy edge indices for prediction
        edge_index = torch.tensor([[0, 1],
                                    [1, 0]], dtype=torch.long)

        predictions = self.model.predict_edges(edge_index, embeddings)
        self.assertEqual(predictions.size(0), edge_index.size(1))  # Predictions should match number of edges
        self.assertTrue(torch.all(predictions >= 0) and torch.all(predictions <= 1))  # Sigmoid output should be in [0, 1]

if __name__ == '__main__':
    unittest.main()

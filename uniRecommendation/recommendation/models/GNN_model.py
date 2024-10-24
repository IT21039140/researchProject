import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import SAGEConv
import torch_geometric

# 2. Define the GNN Model
class CourseRecommendationGNN(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim):
        super(CourseRecommendationGNN, self).__init__()
        self.conv1 = SAGEConv(input_dim, hidden_dim)
        self.conv2 = SAGEConv(hidden_dim, output_dim)
        self.fc = nn.Linear(output_dim * 2, 1)  # Update input dimension to match concatenated edge embeddings

    def forward(self, data):
        x, edge_index = data.x, data.edge_index
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = self.conv2(x, edge_index)
        return x

    def predict_edges(self, edge_index, embeddings):
        edge_embeddings = torch.cat([embeddings[edge_index[0]], embeddings[edge_index[1]]], dim=1)
        return torch.sigmoid(self.fc(edge_embeddings)).view(-1)

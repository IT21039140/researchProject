import os
from django.core.management.base import BaseCommand
import papermill as pm

class Command(BaseCommand):
    help = 'Run a Jupyter notebook'

    def handle(self, *args, **kwargs):
        # Get the path to the Django project root
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        # Define the correct relative paths
        notebook_relative_path = os.path.join('NoteBook', 'Copy_of_Untitled9.ipynb')
        output_notebook_relative_path = os.path.join('NoteBook', 'executed_notebook.ipynb')

        # Create absolute paths
        notebook_path = os.path.join(project_root, 'recommendation', notebook_relative_path)
        output_notebook_path = os.path.join(project_root, 'recommendation', output_notebook_relative_path)

        # Print paths for debugging
        self.stdout.write(f'Notebook path: {notebook_path}')
        self.stdout.write(f'Output notebook path: {output_notebook_path}')
        
        if not os.path.exists(notebook_path):
            self.stdout.write(self.style.ERROR('Notebook file does not exist at the specified path.'))
            return

        # Run the Jupyter notebook using papermill
        self.stdout.write('Running Jupyter notebook...')
        try:
            pm.execute_notebook(
                notebook_path,
                output_notebook_path
            )
            self.stdout.write(self.style.SUCCESS('Notebook executed successfully.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error executing notebook: {e}'))
            raise

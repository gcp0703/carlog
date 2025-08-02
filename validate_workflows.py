#!/usr/bin/env python3
import yaml
import sys
from pathlib import Path

def validate_workflow(file_path):
    """Validate a GitHub Actions workflow file."""
    try:
        with open(file_path, 'r') as f:
            data = yaml.safe_load(f)
        
        # Basic validation
        if 'name' not in data:
            return False, f"Missing 'name' field in {file_path}"
        
        if 'on' not in data:
            return False, f"Missing 'on' field in {file_path}"
        
        if 'jobs' not in data:
            return False, f"Missing 'jobs' field in {file_path}"
        
        # Validate each job
        for job_name, job_config in data.get('jobs', {}).items():
            if 'runs-on' not in job_config:
                return False, f"Job '{job_name}' missing 'runs-on' in {file_path}"
            
            if 'steps' not in job_config:
                return False, f"Job '{job_name}' missing 'steps' in {file_path}"
        
        return True, f"✓ {file_path.name} is valid"
    
    except yaml.YAMLError as e:
        return False, f"YAML Error in {file_path}: {e}"
    except Exception as e:
        return False, f"Error validating {file_path}: {e}"

def main():
    workflows_dir = Path('.github/workflows')
    if not workflows_dir.exists():
        print("No .github/workflows directory found")
        sys.exit(1)
    
    all_valid = True
    
    for workflow_file in workflows_dir.glob('*.yml'):
        valid, message = validate_workflow(workflow_file)
        print(message)
        if not valid:
            all_valid = False
    
    # Also check dependabot.yml
    dependabot_file = Path('.github/dependabot.yml')
    if dependabot_file.exists():
        try:
            with open(dependabot_file, 'r') as f:
                yaml.safe_load(f)
            print(f"✓ {dependabot_file.name} is valid")
        except yaml.YAMLError as e:
            print(f"YAML Error in {dependabot_file}: {e}")
            all_valid = False
    
    sys.exit(0 if all_valid else 1)

if __name__ == '__main__':
    main()
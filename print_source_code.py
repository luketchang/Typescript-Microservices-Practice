import os

EXCLUDED_DIRS = {
    "venv",
    ".venv",
    "site-packages",
    "__pycache__",
    "node_modules",
    ".git",
    "api_clients",
    "__test__",  # Added exclusion for __test__ directory
}

EXCLUDED_EXTENSIONS = (".json",)  # Exclude JSON files


def is_excluded(path):
    """Check if any part of the path contains an excluded directory."""
    return any(excluded in path.split(os.sep) for excluded in EXCLUDED_DIRS)


def list_files_and_print_contents(directory, extensions=(".ts", ".yaml")):
    for root, dirs, files in os.walk(directory):
        # Exclude directories dynamically by modifying `dirs`
        dirs[:] = [d for d in dirs if not is_excluded(os.path.join(root, d))]

        for file in files:
            if file.endswith(EXCLUDED_EXTENSIONS):
                continue  # Skip excluded file types

            if file.endswith(extensions):
                file_path = os.path.join(root, file)
                if is_excluded(file_path):  # Skip files in excluded paths
                    continue

                print("\n" + "=" * 80)
                print(f"File: {file_path}")
                print("=" * 80)

                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        print(f.read())
                except Exception as e:
                    print(f"Could not read file {file_path}: {e}")


if __name__ == "__main__":
    repo_path = os.getcwd()  # Use current directory as the repo path
    list_files_and_print_contents(repo_path)

import os
import sys
import zipfile
import urllib.request
import urllib.error
import json
import io

def create_zip_of_directory(directory_path):
    print(f"Zipping {directory_path}...")
    mem_zip = io.BytesIO()
    with zipfile.ZipFile(mem_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(directory_path):
            if '.git' in root or '__pycache__' in root:
                continue
            for file in files:
                if file.endswith(".py"): # exclude python deploy scripts
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, directory_path)
                zf.write(file_path, arcname)
    return mem_zip.getvalue()

def update_netlify_site(token, site_id, directory_path):
    zip_data = create_zip_of_directory(directory_path)

    print(f"Pushing updated files to Netlify Site: {site_id}...")
    deploy_url = f"https://api.netlify.com/api/v1/sites/{site_id}/deploys"
    deploy_headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/zip"
    }
    
    req_deploy = urllib.request.Request(deploy_url, headers=deploy_headers, data=zip_data, method="POST")
    try:
        with urllib.request.urlopen(req_deploy) as response:
            deploy_info = json.loads(response.read().decode('utf-8'))
            print("-" * 40)
            print("🚀 UPDATE SUCCESSFUL! 🚀")
            print("Your changes have been deployed to Netlify.")
            print("-" * 40)
    except urllib.error.HTTPError as e:
        print(f"Failed to deploy: {e.read().decode('utf-8')}")

if __name__ == "__main__":
    print("--- Netlify Python Updater ---")
    print("This script will push your local files to an existing Netlify site.")
    print("-" * 40)

    # Token and site_id can be passed as CLI args (avoids interactive prompts)
    token = sys.argv[1] if len(sys.argv) > 1 else input("Enter your Netlify Token: ").strip()
    if not token:
        print("Token is required! Exiting...")
        exit(1)

    site_id = sys.argv[2] if len(sys.argv) > 2 else "alaquizpedia.netlify.app"
    print(f"Deploying to site: {site_id}")

    current_dir = os.path.dirname(os.path.abspath(__file__))
    update_netlify_site(token, site_id, current_dir)

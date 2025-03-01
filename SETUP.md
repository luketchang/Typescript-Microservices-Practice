# Setup Guide for Starting the Application

Follow these steps to configure your environment and launch the application:

---

## 1. Prerequisites

- **Docker Desktop with Kubernetes**

  - Ensure that Docker Desktop is running.
  - Verify that Kubernetes is enabled.
  - For guidance, refer to the [Docker Desktop Kubernetes documentation](https://docs.docker.com/desktop/features/kubernetes/).

- **Install Skaffold**
  - Download and install Skaffold following the instructions in the [Skaffold installation guide](https://skaffold.dev/docs/install/).

---

## 2. Configure Secrets

Before running the application, obtain two secrets YAML files from your admin:

- `services-secrets.yaml`
- `alloy-secrets.yaml`

Place these files in the `infra/k8s` directory of your project.

---

## 3. Update the Hosts File

To ensure proper domain resolution:

1. Open the `/etc/hosts` file.
2. Add the following lines at the end of the file:
   ```
   127.0.0.1 kubernetes.docker.internal
   127.0.0.1 ticketing.dev
   ```
3. Save the file.

---

## 4. Start the Application

1. Open a terminal in your project directory.
2. Run the following command to start all services:
   ```
   skaffold dev
   ```

---

## 5. Access the Application

1. Open your web browser and navigate to:
   ```
   http://ticketing.dev
   ```
2. **Bypass Browser Warning (if applicable):**  
   If you receive a security warning, type the phrase `thisisunsafe` directly into the browser (not in the search box) to bypass the warning.

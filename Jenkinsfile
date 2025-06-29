pipeline {
    agent any

    environment {
        IMAGE_NAME = "docker-image"              // name of the Docker image
        REGISTRY = "192.168.100.2:5000"          // private registry on manager
        IMAGE    = "${REGISTRY}/myapp:${env.BUILD_NUMBER}"
        TAG      = "latest"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM', // use Git SCM istallation from Jenkins plugins 
                    branches: [[name: '*/main']], // specify your branch here
                    userRemoteConfigs: [[
                        url: 'https://github.com/chivhor/devops-course.git',
                        credentialsId: 'github-credentials'
                    ]]
                ])
            } 
        }
        
        stage('Build') {
            steps {
                script {
                    // Build Docker image
                    // docker.build(IMAGE_NAME)
                    sh """
                      docker compose -f docker-compose.yml up -d
                    """
                }
            }
        }
        
        stage('Push to DockerHub') {
            steps {
                // Grab creds safely
                withCredentials([
                    usernamePassword(
                        credentialsId: 'docker-hub-credentials',          // ID you set above
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                sh '''
                    # Login (stdin masks the password)
                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

                    # Push tag
                    docker tag ${IMAGE_NAME}:${TAG} $DOCKER_USER/${IMAGE_NAME}:${TAG}
                    docker push $DOCKER_USER/${IMAGE_NAME}:${TAG}
                '''
                }
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                  # Optional: remove existing stack (clean slate)
                  docker -H tcp://192.168.100.2:2375 stack rm myapp
        
                  # Wait a bit to ensure all services shut down
                  sleep 5
        
                  # Recreate the updated stack file with image from Docker Hub
                  cat > docker-stack.yml <<EOF
                  version: "3.9"
                  services:
                    web:
                      image: $DOCKER_USER/${IMAGE_NAME}:${TAG}
                      deploy:
                        replicas: 2
                        restart_policy:
                          condition: on-failure
                      ports:
                        - "9000:80"
                  EOF
        
                  # Deploy fresh stack
                  docker -H tcp://192.168.100.2:2375 stack deploy -c docker-stack.yml myapp
                '''
            }
        }
    }

    post { // Cleanup actions after the pipeline execution
        always {
            // Clean up - remove local images to save space
            sh "docker rmi ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${TAG} ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:latest || true"
            
            // Logout from Docker Hub
            sh "docker logout"
        }
    }
}

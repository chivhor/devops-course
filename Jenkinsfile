pipeline {
    agent any

    environment {
        IMAGE_NAME = "myapp"
        TAG = "${env.BUILD_NUMBER}"
        GITHUB_CREDS = credentials('github-credentials')
        DOCKER_HUB_CREDS = credentials('docker-hub-credentials')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
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
                    // Build Docker image with tag
                    sh "docker build -t ${IMAGE_NAME}:${TAG} ."
                }
            }
        }
        
        stage('Push to DockerHub') {
            steps {
                script {
                    // Login to Docker Hub
                    // Using single-quotes instead of double-quotes when referencing these sensitive environment variables prevents this type of leaking
                    sh 'echo ${DOCKER_HUB_CREDS_PSW} | docker login -u ${DOCKER_HUB_CREDS_USR} --password-stdin'
                    
                    // Push the image
                    sh "docker tag ${IMAGE_NAME}:${TAG} ${DOCKER_HUB_CREDS_USR}/${IMAGE_NAME}:${TAG}"
                    sh "docker push ${DOCKER_HUB_CREDS_USR}/${IMAGE_NAME}:${TAG}"
                }
            }
        }
        
        stage('Deploy') {
            steps {
                    // Optional: Remove old stack
                    sh 'docker stack rm jenkins-swarm || true'
                    sleep(5)

                    // Use writeFile instead of cat > <<EOF
                    writeFile file: 'docker-stack.yml', text: """
version: "3.8"
services:
  web:
    image: ${env.DOCKER_HUB_CREDS_USR}/${env.IMAGE_NAME}:${env.TAG}
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
    ports:
      - "8000:80"
"""

                    // Deploy new stack
                    sh 'docker stack deploy -c docker-stack.yml jenkins-swarm'
            }
        }
    }
    
    post {
        always {
            // Clean up - remove local images to save space
            sh "docker rmi ${IMAGE_NAME}:${TAG} || true"
            
            // Logout from Docker Hub
            sh "docker logout"
        }
    }
}
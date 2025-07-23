pipeline {
    agent any

    environment {
        IMAGE_NAME = "final-project"
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

        stage('Scan with Trivy') {
            steps {
                script {
                    sh "trivy image ${IMAGE_NAME}:${TAG}"
                    sh "trivy image --exit-code 1 --severity HIGH,CRITICAL ${IMAGE_NAME}:${TAG}"
                }
            }
        }
        
        stage('Push to DockerHub') {
            steps {
                script {
                    // Login to Docker Hub
                    // Using single-quotes instead of double-quotes when referencing these sensitive environment variables prevents this type of leaking
                    sh 'echo ${DOCKER_HUB_CREDS_PSW} | docker login -u ${DOCKER_HUB_CREDS_USR} --password-stdin'
                    
                    // Tag docker image
                    sh 'docker tag ${IMAGE_NAME}:${TAG} ${DOCKER_HUB_CREDS_USR}/${IMAGE_NAME}:${TAG}'
                    sh 'docker tag ${IMAGE_NAME}:${TAG} ${DOCKER_HUB_CREDS_USR}/${IMAGE_NAME}:latest'

                    // Push docker image to Docker Hub
                    sh 'docker push ${DOCKER_HUB_CREDS_USR}/${IMAGE_NAME}:${TAG}'
                    sh 'docker push ${DOCKER_HUB_CREDS_USR}/${IMAGE_NAME}:latest'
                }
            }
        }
        
        stage('Deploy to Swarm Master') {
            steps {
                script {
                    sshPublisher(publishers: [
                        sshPublisherDesc(
                            configName: 'swarm-master',
                            transfers: [
                                sshTransfer(
                                    sourceFiles: 'docker-compose.yml',
                                    removePrefix: '',
                                    remoteDirectory: '',
                                    execCommand: 'docker stack deploy --compose-file docker-compose.yml devops-course'
                                )
                            ]
                        )
                    ])
                }
            }
        }
    }
    
    post { // Cleanup and notifications after all stages
        always {
            // Clean up - remove local images to save space
            sh "docker image rm ${IMAGE_NAME}:${TAG}"

            // Remove Docker Hub images to save space
            sh "docker image rm ${DOCKER_HUB_CREDS_USR}/${IMAGE_NAME}:${TAG}"
            
            // Logout from Docker Hub
            sh "docker logout"
        }
    }
}
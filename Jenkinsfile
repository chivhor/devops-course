pipeline {
    agent any

    environment {
        IMAGE_NAME = "docker-image"              // name of the Docker image
        REGISTRY = "192.168.100.2:5000"          // private registry on manager
        IMAGE    = "${REGISTRY}/${IMAGE_NAME}:${env.BUILD_NUMBER}"
        GITHUB_CREDS = credentials('github-credentials') // get GitHub credentials from Jenkins credentials
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
            script {
                // Build Docker image
                docker.build(IMAGE_NAME)
            }
        }
        
        stage('Run Container') {
            steps {
                script {
                    // Run container from built image (optional)
                    docker.image(IMAGE_NAME).inside {
                        sh 'echo Hello from inside container!'
                    }
                }
            }
        }
        
        stage('Deploy') {
            steps {
                sh '''
                  cat &lt;&lt;EOF &gt; docker-stack.yml
                  version: "3.9"
                  services:
                    web:
                      image: $IMAGE
                      deploy:
                        replicas: 2
                        restart_policy:
                          condition: on-failure
                      ports:
                        - "80:80"
                  EOF

                  docker -H tcp://192.168.100.2:2375 \\
                    stack deploy -c docker-stack.yml myapp
                '''
            }
        }
    }
}

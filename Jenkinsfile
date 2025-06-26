pipeline {
    agent any

    environment {
        REGISTRY = "192.168.100.2:5000"          // private registry on manager
        IMAGE    = "${REGISTRY}/myapp:${env.BUILD_NUMBER}"
        GITHUB_CREDS = credentials('github-credentials')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
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
                sh 'docker build -t $IMAGE .'
            }
        }
        
        stage('Push') {
            steps {
                sh 'docker push $IMAGE'
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

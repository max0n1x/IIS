pipeline {
    agent any

    environment {
        REMOTE_HOST = '158.101.215.71'
        REMOTE_USER = 'jenkins-deploy'
        DEPLOY_PATH = '/home/jenkins-deploy/IIS'
        SSH_CREDENTIALS_ID = '228'
    }

    options {
        timeout(time: 1, unit: 'MINUTES')
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Package') {
            steps {
                dir('.') {
                    script {
                        try {
                            sh 'tar --exclude=".git" --exclude="package.tar.gz" -czf package.tar.gz .'
                        } catch (e) {
                            error("Packaging failed.")
                        }
                    }
                }
            }
        }

        stage('Deploy to Remote Host') {
            steps {
                sshagent(credentials: [SSH_CREDENTIALS_ID]) {
                    script {
                        sh "scp -o StrictHostKeyChecking=no package.tar.gz ${REMOTE_USER}@${REMOTE_HOST}:${DEPLOY_PATH}"

                        sh """
                        ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} << EOF
                            cd ${DEPLOY_PATH}
                            ls | grep -v 'package.tar.gz' | xargs rm -rf
                            tar -xzf package.tar.gz
                            rm package.tar.gz
                            docker-compose up --build -d
                        EOF
                        """
                    }
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                sshagent(credentials: [SSH_CREDENTIALS_ID]) {
                    script {
                        def check = sh(
                            script: "ssh ${REMOTE_USER}@${REMOTE_HOST} 'docker ps -q -f name=my_container_name'",
                            returnStatus: true
                        )
                        if (check != 0) {
                            error("Deployment verification failed. Container is not running.")
                        }
                    }
                }
            }
        }
    }
    
    post {
        success {
            emailext (
                subject: "Build success in Jenkins: ${currentBuild.fullDisplayName}",
                body: "Deployment was successful. Check details here: ${env.BUILD_URL}. Duration: ${currentBuild.durationString}",
                recipientProviders: [[$class: 'DevelopersRecipientProvider']]
            )
            echo "Deployment was successful."
        }

        failure {
            emailext (
                subject: "Build failed in Jenkins: ${currentBuild.fullDisplayName}",
                body: "Deployment failed. Check details here: ${env.BUILD_URL}. Duration: ${currentBuild.durationString}",
                recipientProviders: [[$class: 'DevelopersRecipientProvider']]
            )
            echo "Deployment failed."
        }

        aborted {
            emailext (
                subject: "Build timeout in Jenkins: ${currentBuild.fullDisplayName}",
                body: "Deployment was not completed in time. Check details here: ${env.BUILD_URL}. Duration: ${currentBuild.durationString}",
                recipientProviders: [[$class: 'DevelopersRecipientProvider']]
            )
            echo "Deployment was not completed in time."
        }


        always {
            cleanWs()
        }
    }
}

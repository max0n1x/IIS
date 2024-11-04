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
                subject: "Build Success in Jenkins: ${currentBuild.fullDisplayName}",
                body: """
                    <html>
                    <body>
                        <p><strong style="color: green;">Deployment was successful.</strong></p>
                        <p>Check details here: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                        <p><strong>Duration:</strong> ${currentBuild.durationString}</p>
                        <ul>
                            <li><strong>Build Number:</strong> ${currentBuild.number}</li>
                            <li><strong>Status:</strong> ${currentBuild.result}</li>
                            <li><strong>Started by:</strong> ${currentBuild.getBuildCauses()}</li>
                            <li><strong>Timestamp:</strong> ${new Date(currentBuild.startTimeInMillis).format("yyyy-MM-dd HH:mm:ss", TimeZone.getTimeZone("UTC"))} UTC</li>
                            <li><strong>Workspace:</strong> ${env.WORKSPACE}</li>
                            <li><strong>Node:</strong> ${env.NODE_NAME}</li>
                            <li><strong>Job URL:</strong> <a href="${env.JOB_URL}">${env.JOB_URL}</a></li>
                        </ul>
                    </body>
                    </html>
                """,
                mimeType: 'text/html',
                recipientProviders: [[$class: 'DevelopersRecipientProvider']]
            )
            echo "Deployment was successful."
        }

        failure {
            emailext (
                subject: "Build Failed in Jenkins: ${currentBuild.fullDisplayName}",
                body: """
                    <html>
                    <body>
                        <p><strong style="color: red;">Deployment failed.</strong></p>
                        <p>Check details here: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                        <p><strong>Duration:</strong> ${currentBuild.durationString}</p>
                        <ul>
                            <li><strong>Build Number:</strong> ${currentBuild.number}</li>
                            <li><strong>Status:</strong> ${currentBuild.result}</li>
                            <li><strong>Started by:</strong> ${currentBuild.getBuildCauses()}</li>
                            <li><strong>Timestamp:</strong> ${new Date(currentBuild.startTimeInMillis).format("yyyy-MM-dd HH:mm:ss", TimeZone.getTimeZone("UTC"))} UTC</li>
                            <li><strong>Workspace:</strong> ${env.WORKSPACE}</li>
                            <li><strong>Node:</strong> ${env.NODE_NAME}</li>
                            <li><strong>Job URL:</strong> <a href="${env.JOB_URL}">${env.JOB_URL}</a></li>
                        </ul>
                    </body>
                    </html>
                """,
                mimeType: 'text/html',
                recipientProviders: [[$class: 'DevelopersRecipientProvider']]
            )
            echo "Deployment failed."
        }

        aborted {
            emailext (
                subject: "Build Timeout in Jenkins: ${currentBuild.fullDisplayName}",
                body: """
                    <html>
                    <body>
                        <p><strong style="color: gray;">Deployment was not completed in time.</strong></p>
                        <p>Check details here: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                        <p><strong>Duration:</strong> ${currentBuild.durationString}</p>
                        <ul>
                            <li><strong>Build Number:</strong> ${currentBuild.number}</li>
                            <li><strong>Status:</strong> ${currentBuild.result}</li>
                            <li><strong>Started by:</strong> ${currentBuild.getBuildCauses()}</li>
                            <li><strong>Timestamp:</strong> ${new Date(currentBuild.startTimeInMillis).format("yyyy-MM-dd HH:mm:ss", TimeZone.getTimeZone("UTC"))} UTC</li>
                            <li><strong>Workspace:</strong> ${env.WORKSPACE}</li>
                            <li><strong>Node:</strong> ${env.NODE_NAME}</li>
                            <li><strong>Job URL:</strong> <a href="${env.JOB_URL}">${env.JOB_URL}</a></li>
                        </ul>
                    </body>
                    </html>
                """,
                mimeType: 'text/html',
                recipientProviders: [[$class: 'DevelopersRecipientProvider']]
            )
            echo "Deployment was not completed in time."
        }

        always {
            cleanWs()
        }

    }
}

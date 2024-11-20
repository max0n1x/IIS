def currentStage = 'Initialization'

pipeline {
    agent any

    environment {
        REMOTE_HOST = '158.101.215.71'
        REMOTE_USER = 'jenkins-deploy'
        DEPLOY_PATH = '/home/jenkins-deploy/IIS'
        SSH_CREDENTIALS_ID = '228'
    }

    options {
        timeout(time: 45, activity: true, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
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
                            sh 'docker compose -f docker-compose.yml build'
                            sh 'docker save -o package.tar.gz iis-frontend iis-backend'
                        } catch (e) {
                            currentStage = 'Packaging'
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
                        currentStage = 'Deployment'
                        sh "scp -o StrictHostKeyChecking=no package.tar.gz ${REMOTE_USER}@${REMOTE_HOST}:${DEPLOY_PATH}"

                        sh """
                        ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} /bin/bash << 'EOF'
                            cd ${DEPLOY_PATH}
                            $API_URL=https://garage-sale.cz/api/v1.0
                            docker load -i package.tar.gz
                            docker compose -f docker-compose.yml up -d
                        << EOF
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
                            script: "ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} 'docker ps -q -f name=frontend -f name=backend | wc -l'",
                            returnStdout: true
                        ).trim().toInteger()

                        echo "Check: ${check}"
                        if (check != 2) {
                            currentStage = 'Deployment Verification'
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
                        <ul>
                            <li><strong>Duration:</strong> ${currentBuild.durationString}</li>
                            <li><strong>Build Number:</strong> ${currentBuild.number}</li>
                            <li><strong>Status:</strong> ${currentBuild.result}</li>
                            <li><strong>Started by:</strong> ${currentBuild.getBuildCauses().collect { it.shortDescription }.join(', ')}</li>
                            <li><strong>Timestamp:</strong> ${new Date(currentBuild.startTimeInMillis).format("yyyy-MM-dd HH:mm:ss", TimeZone.getTimeZone("UTC"))} UTC</li>
                            <li><strong>Workspace:</strong> ${env.WORKSPACE}</li>
                            <li><strong>Node:</strong> ${env.NODE_NAME}</li>
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
                subject: "Build Failed in Jenkins: ${currentBuild.fullDisplayName} on the ${currentStage} stage",
                body: """
                    <html>
                    <body>
                        <p><strong style="color: red;">Pipeline failed in the <em>${currentStage}</em> stage.</strong></p>
                        <p>Check details here: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                        <ul>
                            <li><strong>Duration:</strong> ${currentBuild.durationString}</li>
                            <li><strong>Build Number:</strong> ${currentBuild.number}</li>
                            <li><strong>Status:</strong> ${currentBuild.result}</li>
                            <li><strong>Started by:</strong> ${currentBuild.getBuildCauses().collect { it.shortDescription }.join(', ')}</li>
                            <li><strong>Timestamp:</strong> ${new Date(currentBuild.startTimeInMillis).format("yyyy-MM-dd HH:mm:ss", TimeZone.getTimeZone("UTC"))} UTC</li>
                            <li><strong>Workspace:</strong> ${env.WORKSPACE}</li>
                            <li><strong>Node:</strong> ${env.NODE_NAME}</li>
                        </ul>
                    </body>
                    </html>
                """,
                mimeType: 'text/html',
                recipientProviders: [[$class: 'DevelopersRecipientProvider']]
            )
            cleanup()
            echo "Deployment failed."
        }

        aborted {
            emailext (
                subject: "Build Timeout in Jenkins: ${currentBuild.fullDisplayName} on the ${currentStage} stage",
                body: """
                    <html>
                    <body>
                        <p><strong style="color: gray;">Pipeline was not completed in time and was aborted on the <em>${currentStage}</em> stage.</strong></p>
                        <p>Check details here: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                        <ul>
                            <li><strong>Duration:</strong> ${currentBuild.durationString}</li>
                            <li><strong>Build Number:</strong> ${currentBuild.number}</li>
                            <li><strong>Status:</strong> ${currentBuild.result}</li>
                            <li><strong>Started by:</strong> ${currentBuild.getBuildCauses().collect { it.shortDescription }.join(', ')}</li>
                            <li><strong>Timestamp:</strong> ${new Date(currentBuild.startTimeInMillis).format("yyyy-MM-dd HH:mm:ss", TimeZone.getTimeZone("UTC"))} UTC</li>
                            <li><strong>Workspace:</strong> ${env.WORKSPACE}</li>
                            <li><strong>Node:</strong> ${env.NODE_NAME}</li>
                        </ul>
                    </body>
                    </html>
                """,
                mimeType: 'text/html',
                recipientProviders: [[$class: 'DevelopersRecipientProvider']]
            )
            cleanup()
            echo "Deployment was not completed in time."
        }
        always {
            cleanWs()
        }

    }
}

def cleanup() {
    sshagent(credentials: [SSH_CREDENTIALS_ID]) {
        sh """
        ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} /bin/bash << EOF
            sudo pkill -9 -f 'node|npm install'
            <<EOF
        """
    }
}




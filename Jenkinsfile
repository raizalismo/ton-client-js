pipeline {
    agent any
    options { 
        buildDiscarder logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '', numToKeepStr: '5')
        disableConcurrentBuilds()
        parallelsAlwaysFailFast()
        githubPush()
    }
    stages {
        stage('Started') {
            steps {
                echo "Job: ${JOB_NAME}"
            }
        }
    }
}
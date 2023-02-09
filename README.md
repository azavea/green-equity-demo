# Azavea Project Template

# Guide to starting a new project from this template

Delete each section when it's completed or if it's not relevant to this project. At the end of this document, this file will be deleted and replaced using the README_TEMPLATE

## GitHub

* Create GitHub repository - you want an empty repo so don't create a readme, or license via the UI
* Grant the relevant Azavea development Github team "Write" access to repository (Setting > Collaborators & teams) and grant the project lead "Admin" access

## Source Code

* Copy "Azavea Project Template" contents
    ```sh
    git clone --depth=1 git@github.com:azavea/azavea-project-template.git actual-project-name
    cd actual-project-name
    TEMPLATE_SHA=$(git rev-parse --short HEAD) 
    # for fish: set TEMPLATE_SHA (git rev-parse --short HEAD)
    rm -rf .git
    ```
* Rename the project-name directory in src/django
    ```sh
    mv src/django/project-name src/django/actual-project-name
    ```
* Update or delete CODEOWNERS
* Replace references to `Project Name` in the `README_TEMPLATE.md`
* Edit italicized sections of the `README_TEMPLATE.md` to be specific to the project.
* Replace references to `project-name` `docker-compose.yml`, and `src/app/package.json`
    ```sh
    # MacOS
    grep -srlp project-name * --exclude README.md | xargs sed -i .bak 's/project-name/actual-project-name/'; find . -name "*.bak" -delete
    # Linux
    grep -srl project-name * --exclude README.md | xargs sed -i.bak 's/project-name/actual-project-name/'; find . -name "*.bak" -delete
    ```
* Replace references to `Project Name` in the django api app admin file.
    ```sh
    # MacOS
    sed -i .bak 's/Project Name/Actual Project Name/' src/django/api/admin.py; find . -name "*.bak" -delete
    # Linux
    sed -i.bak 's/Project Name/Actual Project Name/' src/django/api/admin.py; find . -name "*.bak" -delete    
    ```
* Set port numbers and replace placeholders in `README_TEMPLATE.md` and `docker-compose.override.yml`
* Commit the modified template code:
    ```sh
    # for git 2.28.0 and later
    git init --initial-branch=main
    
    # for earlier git versions
    git init
    git checkout -b main

    # then, regardless of git version
    git add .
    git commit -m "Import app template at $TEMPLATE_SHA"
    git remote add origin git@github.com:azavea/actual-project-name.git
    git push -u origin main
    git checkout -b develop
    git push -u origin develop
    ```

### GitHub Branch Policy

* Make `develop` the default branch
* Add branch protection for `main`:
  - require a pull request, require approval
  - require CI to pass
* Make `develop`:
  - require a pull request, require approval
  - require CI to pass

## Project Management

* Add project to ZenHub

## Continuous Integration

* A Github Actions PR builder workflow is included

## PR and Issue templates

* Take the opportunity to reflect on what kinds of issue and PR templates and template sections might be useful for this project
  * Update or remove reminders section in `.github/ISSUE_TEMPLATE/feature_request.md` and `.github/PULL_REQUEST_TEMPLATE.md`. These are specific to the project template and deal with cross-team collaboration, which is likely not an issue in this project.

## Deployments

* Obtain AWS credentials
* Follow deployment/README.md Setup guide
* For Staging setup GitHub Actions to deploy from the `develop` branch
* For Production setup GitHub Actions to deploy from the `main` branch

## Python packages

* Include version number in `setup.py`
* Setup Python debug logging

## Update README

* Once everything above is complete, delete this file
* Rename `README_TEMPLATE.md` to `README.md` and update it for your project
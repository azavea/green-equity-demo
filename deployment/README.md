# Deployment

- [AWS Credentials](#aws-credentials)
- [Terraform](#terraform)
- [Setup](#setup)

## AWS Credentials

Copy/export your credentials to the active terminal:

```bash
export AWS_ACCESS_KEY_ID=""
export AWS_SECRET_ACCESS_KEY=""
export AWS_SESSION_TOKEN=""
```

## Terraform

To deploy this project's core infrastructure, use the `infra` wrapper script to lookup the remote state of the infrastructure and assemble a plan for work to be done:

```bash
./scripts/infra stg plan
```

Once the plan has been assembled, and you agree with the changes, apply it:

```bash
./scripts/infra stg apply
```

## Initial Setup

How to setup a new project/environment.

1. Now we set some environment variables before we get started. These should be applied both in your current terminal, and to replace the example values at the beginning of ./scripts/_sourced.

    ```bash
    export PROJECTNAME=template
    export ENVIRONMENT=stg
    export AWS_REGION=us-west-2
    export CONFIG_BUCKET=$PROJECTNAME-$ENVIRONMENT-config
    ```

1. Create an S3 bucket with version tracking and no public access

    ```bash
    aws s3api create-bucket --bucket $CONFIG_BUCKET \
    --region $AWS_REGION --create-bucket-configuration LocationConstraint=$AWS_REGION
    aws s3api put-bucket-versioning --bucket $CONFIG_BUCKET \
    --versioning-configuration Status=Enabled
    aws s3api put-public-access-block --bucket $CONFIG_BUCKET \
    --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
    ```

1. Add encryption to S3 bucket

    ```bash
    aws s3api put-bucket-encryption --bucket $CONFIG_BUCKET --server-side-encryption-configuration '{
    "Rules": [
            {
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "aws:kms",
                    "KMSMasterKeyID": "KMS-Key-ARN"
                },
                "BucketKeyEnabled": true
            }
        ]
    }'
    ```

1. Create your specific terraform variables file and use environment variables to have it setup.

    ```bash
    envsubst < deployment/tfvars-template.txt > deployment/terraform/$CONFIG_BUCKET.tfvars
    ```

1. Modify ./scripts/_sourced to add your new environment to set_environment.
1. Run ./scripts/infra $ENVIRONMENT update-tfvars to create the tfvars in the S3 bucket
1. We want to just create the ECR repo next, as everything else depends on having at least one image in it.

    ```bash
    ./scripts/infra $ENVIRONMENT passthrough init -backend-config="bucket=${CONFIG_BUCKET}" \
            -backend-config="key=terraform/state"
    ./scripts/infra $ENVIRONMENT passthrough plan -var="image_tag=" -var-file="${CONFIG_BUCKET}.tfvars" -out="${CONFIG_BUCKET}.tfplan" -target=aws_ecr_repository.default
    ```

1. Apply it ./scripts/infra $ENVIRONMENT apply
1. Build and publish a container image with

    ```bash
    ./scripts/citasks
    ./scripts/update
    ./scripts/test
    ./scripts/cipublish $ENVIRONMENT
    ```

1. Add the rest of the terraform with

    ```bash
    ./scripts/infra $ENVIRONMENT plan
    ./scripts/infra $ENVIRONMENT apply
    ```

## Destroy a project

1. Manually delete images in ECR
1. Run terraform to destroy everything.

    ```bash
    ./scripts/infra $ENVIRONMENT passthrough apply -destroy -var="image_tag=" -var-file="${CONFIG_BUCKET}.tfvars"
    ```

1. Empty and then delete the $CONFIG_BUCKET

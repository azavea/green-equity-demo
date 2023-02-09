#
# ECR resources
#
resource "aws_ecr_repository" "default" {
  name = local.short
}
locals {
  short = "${var.project}-${var.environment}"
}

variable "project" {
  # Lowercase project name
  type = string
}

variable "environment" {
  # Lowercase environment name
  type = string
}

variable "aws_region" {
  default = "us-west-2"
  type    = string
}

variable "image_tag" {
  type = string
}
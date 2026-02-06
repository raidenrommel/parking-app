terraform {
  backend "s3" {
    bucket         = "parking-terraform-state-rommel"
    key            = "parking-app/terraform.tfstate"
    region         = "ap-southeast-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}


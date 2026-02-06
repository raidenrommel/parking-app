resource "aws_lambda_function" "api" {
  function_name = "parking-api"
  role          = aws_iam_role.lambda_role.arn
  runtime       = "nodejs18.x"
  handler       = "index.handler"

  filename         = "../backend/lambda.zip"
  source_code_hash = filebase64sha256("../backend/lambda.zip")

  # ===============================
  # SECTION: Lambda Environment Vars
  # ===============================
  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.slots.name

      # ===============================
      # ADMIN SECURITY (RESET PROTECTION)
      # ===============================
      ADMIN_KEY  = var.admin_key
    }
  }

  tags = {
    Project = "parking"
  }
}


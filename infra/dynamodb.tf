resource "aws_dynamodb_table" "slots" {
  name         = "parking-slots"
  billing_mode = "PAY_PER_REQUEST"

  hash_key = "slotCode"

  attribute {
    name = "slotCode"
    type = "S"
  }

  tags = {
    Project = "parking"
  }
}

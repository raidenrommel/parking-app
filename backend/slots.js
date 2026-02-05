const AWS = require("aws-sdk");
const { calculateDaysLeft } = require("./utils");

const dynamo = new AWS.DynamoDB.DocumentClient({ region: "ap-southeast-1" });
const TABLE = process.env.TABLE_NAME;

async function getSlots(branch) {
  const res = await dynamo.scan({ TableName: TABLE }).promise();

  return res.Items
    .filter(s => s.slotCode.startsWith(branch))
    .map(s => {
      if (s.isOccupied && s.startDate && s.durationMonths) {
        s.daysLeft = calculateDaysLeft(s.startDate, s.durationMonths);
        s.expired = s.daysLeft <= 0;
      }
      return s;
    });
}

async function paySlot(body) {
  const {
    slotCode,
    renterName,
    renterEmail,
    renterContact,
    plateNumber,
    durationMonths,
    cardNumber,
    cvv,
    cardHolder
  } = body;

  if (!slotCode || !renterName || !renterEmail || !renterContact || !plateNumber) {
    return { statusCode: 400, body: "Missing renter information" };
  }

  if (!/^\d{16}$/.test(cardNumber)) {
    return { statusCode: 400, body: "Invalid card number" };
  }
  if (!/^\d{3,4}$/.test(cvv)) {
    return { statusCode: 400, body: "Invalid CVV" };
  }
  if (!cardHolder) {
    return { statusCode: 400, body: "Cardholder required" };
  }

  if (Math.random() > 0.8) {
    return { statusCode: 402, body: "Payment declined" };
  }

  await dynamo.update({
    TableName: TABLE,
    Key: { slotCode },
    UpdateExpression: `
      SET isOccupied = :o,
          renterName = :rn,
          renterEmail = :re,
          renterContact = :rc,
          plateNumber = :pn,
          startDate = :sd,
          durationMonths = :dm
    `,
    ExpressionAttributeValues: {
      ":o": true,
      ":rn": renterName,
      ":re": renterEmail,
      ":rc": renterContact,
      ":pn": plateNumber,
      ":sd": Date.now(),
      ":dm": Number(durationMonths || 1)
    }
  }).promise();

  return { statusCode: 200, body: "Payment successful" };
}

async function resetAll() {
  const res = await dynamo.scan({ TableName: TABLE }).promise();

  if (!res.Items || res.Items.length === 0) {
    const seed = [
      { slotCode: "MKT-001", slotName: "Slot 1", recommendedVehicle: "Sedan", lengthFt: 16, widthFt: 8, isOccupied: false },
      { slotCode: "MKT-002", slotName: "Slot 2", recommendedVehicle: "Sedan", lengthFt: 16, widthFt: 8, isOccupied: false },
      { slotCode: "MKT-003", slotName: "Slot 3", recommendedVehicle: "SUV / Mini Van", lengthFt: 18, widthFt: 10, isOccupied: false },
      { slotCode: "BGC-001", slotName: "Slot 1", recommendedVehicle: "Sedan", lengthFt: 16, widthFt: 8, isOccupied: false },
      { slotCode: "BGC-002", slotName: "Slot 2", recommendedVehicle: "SUV / Mini Van", lengthFt: 18, widthFt: 10, isOccupied: false }
    ];

    for (const item of seed) {
      await dynamo.put({ TableName: TABLE, Item: item }).promise();
    }

    return { statusCode: 200, body: "Demo seeded" };
  }

  for (const slot of res.Items) {
    await dynamo.update({
      TableName: TABLE,
      Key: { slotCode: slot.slotCode },
      UpdateExpression: `
        SET isOccupied = :o,
            renterName = :n,
            renterEmail = :n,
            renterContact = :n,
            plateNumber = :n,
            startDate = :n,
            durationMonths = :n
      `,
      ExpressionAttributeValues: {
        ":o": false,
        ":n": null
      }
    }).promise();
  }

  return { statusCode: 200, body: "Demo reset complete" };
}

module.exports = { getSlots, paySlot, resetAll };

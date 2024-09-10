import asyncHandler from "../utils/asyncHandler.js";
import Transaction from "../models/Transaction.js";

const getTransactions = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const transactions = await Transaction.find({ laptop: id }).sort(
    "-createdAt"
  );

  res.status(200).json(transactions);
});

const transactionsController = { getTransactions };

export default transactionsController;

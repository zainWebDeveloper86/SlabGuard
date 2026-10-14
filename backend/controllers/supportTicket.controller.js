import SupportTicket from "../models/supportTicket.model.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const createTicket = catchAsyncErrors(async (req, res, next) => {
  const { category, message } = req.body;
  if (!category || !message) {
    return next(new ErrorHandler("Category and message are required", 400));
  }

  const ticket = await SupportTicket.create({
    user: req.user._id,
    category,
    message,
  });
  res.status(201).json({ success: true, message: "Ticket raised", ticket });
});

// for user
export const getMyTickets = catchAsyncErrors(async (req, res, next) => {
  const tickets = await SupportTicket.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.status(200).json({ success: true, tickets });
});

// Admin — sees everyone's tickets
export const getAllTickets = catchAsyncErrors(async (req, res, next) => {
  const tickets = await SupportTicket.find({})
    .populate("user", "fullName email")
    .sort({ createdAt: -1 });
  // console.log(tickets);
  res.status(200).json({ success: true, tickets });
});

export const updateTicket = catchAsyncErrors(async (req, res, next) => {
  const { status, adminReply } = req.body;
  const update = {};
  if (status) update.status = status;
  if (adminReply) {
    update.adminReply = adminReply;
    update.repliedAt = new Date();
    if (!status) update.status = "In-Progress"; // replying implicitly moves it forward
  }

  const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, update, {
    new: true,
  }).populate("user", "fullName email");
  if (!ticket) return next(new ErrorHandler("Ticket not found", 404));

  res.status(200).json({ success: true, ticket });
});

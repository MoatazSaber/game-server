import express from "express";
import socket from "socket.io";
import logger from "./utils/logger";
import { saveMove, getUpdatedItems } from "./schema";

const app = express();
const port = 3000;
var server = app.listen(port, () => {
  logger.info(`🚀 Server ready at port ${port}`);
});

// Socket setup
const io = socket(server, { path: "/" });

io.on("connection", (socket) => {
  socket.on("join", async (data) => {
    let itemList = await getUpdatedItems({ uid: data.user });
    socket.emit("updateItems", itemList);
    // console.log({ msg: "New client connected", data: data, items: itemList });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  socket.on("move", async (data) => {
    await saveMove(data);
    let updatedItems = await getUpdatedItems(data);
    socket.emit("updateItems", updatedItems);
  });
});

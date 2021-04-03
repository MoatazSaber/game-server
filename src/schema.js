const mongoose = require("mongoose");
import { initItems } from "./data/Items";

mongoose
  .connect(
    "mongodb+srv://test:test@cluster0.siwt1.mongodb.net/gameDb?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      //
    }
  )
  .catch((err) => {
    console.log(err);
  });
const Item = mongoose.Schema({
  id: Number,
  type: String,
  value: Number,
});

const Move = mongoose.model(
  "Move",
  {
    userId: Number,
    fromItem: {},
    toItem: {},
    timestamp: Date,
  },
  "Moves"
);
const State = mongoose.model(
  "State",
  {
    currentPlayer: String,
    items: [Item],
  },
  "State"
);
// const Active = mongoose.model("Active", { userId: Number }, "ActiveUsers");

// export const userJoined = (uid) => {};
// export const userLeft = (uid) => {};

export const saveMove = async (moveData) => {
  const move = new Move({
    _id: mongoose.Types.ObjectId(),
    userId: moveData.uid,
    toItem: {
      id: moveData.toItem.id,
      type: moveData.toItem.type,
      value: moveData.toItem.value,
    },
    fromItem: {
      id: moveData.fromItem.id,
      type: moveData.fromItem.type,
      value: moveData.fromItem.value,
    },
    timestamp: new Date(),
  });
  await move.save();
  // console.log({ status: "Saved", item: { ...moveData } });
};

export const getUpdatedItems = async (move) => {
  // get current state
  let currentState;
  await State.find({}, (err, states) => {
    currentState =
      states.items && states.items.length > 0 ? states.items : initItems;
  });
  let updatedItems = currentState;
  if (move.toItem && move.fromItem) {
    let from = move.fromItem;
    let to = move.toItem;
    console.log({ toBefore: to.value, fromBefore: from.value });
    updatedItems[to.id].value -= 1;
    updatedItems[from.id].value += 1;
    console.log(updatedItems[to.id].value);
  }
  // console.log({ move: move, updatedItems: updatedItems });
  // TODO calculate new Items (logic)
  // clean state
  State.deleteMany({}, (_) => {});
  // save state
  const state = new State({
    _id: mongoose.Types.ObjectId(),
    currentPlayer: move.uid,
    items: updatedItems,
  });

  await state.save();
  // console.log({ status: "Saved", state: updatedItems });

  // saveItems to State collection
  return updatedItems;
};

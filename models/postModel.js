import { mongo, Schema } from "mongoose";

const postSchema = new Schema({
    title:String,
    slug:String,
    content:String,
    image:String,
    createdAt:{
        type: Date,
        default: new date(),
    },
    user:{
        type: mongoose.Schema.Type.ObjectId,
        ref: "User",
    }
})

const Post = mongoose.model('Post',postSchema)
export default Post
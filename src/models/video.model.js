import mongoose , {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema (
    {
        vodeoFile:{
            type:String ,
            required:true
        },
        thumbnail:{
            type:String,
            required:true
        },
        title:{
            type:String,
            required:true
        },
        description: {
            type:String,
            required:true
        },
        duration:{
            type:Number,
            required:true
        },
        views:{
            type:Boolean,
            default: 0,

        },
        isPublished:{
            tyor:Boolean,
            default:true
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },{timestamps:true}
)

videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video", videoSchema)
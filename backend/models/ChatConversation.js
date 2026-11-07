const mongoose=require('mongoose');
module.exports=mongoose.model('ChatConversation',new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},messages:[{role:{type:String,enum:['user','assistant'],required:true},content:{type:String,required:true,maxlength:2000},createdAt:{type:Date,default:Date.now}}]},{timestamps:true}));

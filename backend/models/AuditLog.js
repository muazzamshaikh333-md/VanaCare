const mongoose=require('mongoose');
module.exports=mongoose.model('AuditLog',new mongoose.Schema({actor:{type:mongoose.Schema.Types.ObjectId,ref:'User'},action:{type:String,required:true},targetType:String,targetId:String,ip:String,metadata:mongoose.Schema.Types.Mixed},{timestamps:true}));

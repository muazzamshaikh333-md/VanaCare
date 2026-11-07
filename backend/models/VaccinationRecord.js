const mongoose=require('mongoose');
module.exports=mongoose.model('VaccinationRecord',new mongoose.Schema({owner:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},pet:{type:mongoose.Schema.Types.ObjectId,ref:'Pet',required:true},vaccine:{type:String,required:true},administeredAt:Date,nextDueAt:Date,notes:String},{timestamps:true}));

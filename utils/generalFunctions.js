export const calculateAmount =(amount, users)=>{
    const SERVICE_CHARGES = 0.02;
    let groupMonthlyCharges = Number((amount  * SERVICE_CHARGES));
    groupMonthlyCharges = Number(amount) + Number(groupMonthlyCharges);
    let perMemberCharges = groupMonthlyCharges / users;
    return perMemberCharges;

}

export const totalAmount = (amount)=>{
    const SERVICE_CHARGES = 0.02;
    let groupMonthlyCharges = Number((amount  * SERVICE_CHARGES));
    groupMonthlyCharges = Number(amount) + Number(groupMonthlyCharges);
    return groupMonthlyCharges;
}
class RandomRoom{


    static getString(){
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = ' ';
        const charactersLength = characters.length;
        for ( let i = 0; i < 12; i++ ) {
            result += characters.charAt(Math.random() * charactersLength);
        }

        return result
    }
}

module.exports = RandomRoom;
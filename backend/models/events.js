const mongoose - require('mongoose');

let schema = mongoose.Schema(
    {
        vm: String,
        type: String,
        vm_tier: String,
        time: {
            type: String,
            set: Date.now
        },
        user: String
    }
)

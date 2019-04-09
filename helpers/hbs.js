module.exports = {

    /**
     * Appropriately assigns the “new” class to the read messages.
     * 
     * @param {Int} read Whether or not the message is read.
     */
    isMsgNew: function(read) {
        
        if (read.readInt8(0) == 0) {
            return 'new';
        }
    },

    /**
     * Appropriately assigns the selection mode of the entries of the mail-mode-select input.
     * 
     * @param {Int} mode The current mail mode.
     * @param {Int} option The according select value.
     */
    select: function(mode, option) {
        
        if (mode == option) {
            return "selected";
        }
    },

    /**
     * Assings an appopriate tag for a category given into consideration whether it's a parent category or a sub category.
     * 
     * @param {String} categoryParent The category's parent name.
     */
    categoryTag: function (categoryParent) {

        if (categoryParent == null) {

            return "Parent category";
        } else {

            return `Sub category of ${categoryParent}`;
        }
    }
}

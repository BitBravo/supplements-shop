module.exports = {

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
    }
}

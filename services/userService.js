// userService.js
function getUserById(id) {
    const users = [
        { id: 1, name: 'Ravi' },
        { id: 2, name: 'Aman' }
    ];
    return users.find(u => u.id === id);
}
module.exports = { getUserById };

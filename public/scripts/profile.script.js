const username = document.querySelector('#username');
const email = document.querySelector('#email');
const token = localStorage.getItem('token');

if (!token) {
    window.location.href = '/login';
}

axios
    .get('/api/v1/users/profile', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    .then(({ data }) => {
        username.textContent = data.msg.username;
        email.textContent = data.msg.email;
    })
    .catch((e) => console.log(e));

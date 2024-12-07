const loginForm = document.querySelector('#loginForm');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
        const { data } = await axios.post('/api/v1/users/login', {
            email,
            password,
        });

        localStorage.setItem('token', data.msg.token);

        if (data.msg.role_id === 1) {
            window.location.href = '/admin';
            return;
        }

        window.location.href = '/profile';
    } catch (error) {
        console.log(error);
    }
});

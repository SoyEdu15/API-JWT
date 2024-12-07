const logout = document.querySelector('#logout');
const clientVets = document.querySelector('#clientVets');
const clientUsers = document.querySelector('#clientUsers');

const token = localStorage.getItem('token');

if (!token) {
    window.location.href = "/login";
}

logout.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = "/login";
});

const getUsers = async () => {
    try {
        const { data } = await axios.get('/api/v1/users/', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const { msg: users } = data;

        clientVets.textContent = "";
        clientUsers.textContent = "";

        users.forEach(user => {
            if (user.role_id === 1) return;

            const li = document.createElement('li');
            li.textContent = user.username;

            if (user.role_id === 3) {
                // Rol de cliente
                const promoteButton = document.createElement('button');
                promoteButton.textContent = "Promover a Veterinario";
                promoteButton.addEventListener('click', async () => {
                    if (!confirm("¿Estás seguro de que deseas promover a este usuario a Veterinario?")) {
                        return;
                    }
                    try {
                        await axios.put(`/api/v1/users/update-role-vet/${user.uid}`, {}, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        });
                        getUsers();
                    } catch (error) {
                        console.log(error);
                    }
                });
                li.appendChild(promoteButton);
                clientUsers.appendChild(li);
                return;
            }

            // Rol de veterinario
            const demoteButton = document.createElement('button');
            demoteButton.textContent = "Degradar a Cliente";
            demoteButton.addEventListener('click', async () => {
                if (!confirm("¿Estás seguro de que deseas degradar a este usuario a Cliente?")) {
                    return;
                }
                try {
                    await axios.put(`/api/v1/users/update-role-user/${user.uid}`, {}, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    getUsers();
                } catch (error) {
                    console.log(error);
                }
            });
            li.appendChild(demoteButton);
            clientVets.appendChild(li);
        });
    } catch (error) {
        console.log(error);
    }
};

getUsers();

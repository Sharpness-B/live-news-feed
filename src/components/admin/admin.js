import React, { useEffect, useState } from 'react';
import { Navigate } from "react-router-dom";
import NavBar from '../common/navBar';
import { useUser } from "../../context/useUser";
import { Table, Button, Input } from 'antd';
import { fetchUsers, toggleUserStatus, addUser, deleteUser } from "../../data/services/firestore";

const AdminPage = () => {
    const { user } = useUser();
    const [users, setUsers] = useState([]);
    const [newEmail, setNewEmail] = useState('');
  
    useEffect(() => {
      const fetchData = async () => {
        const data = await fetchUsers();
        setUsers(data);
      };
  
      fetchData();
    }, []);

  const handleToggleUserStatus = async (id, isPayingUser) => {
    await toggleUserStatus(id, isPayingUser);
    const data = await fetchUsers();
    setUsers(data);
  };

  const handleDeleteUser = async (id) => {
    await deleteUser(id);
    const data = await fetchUsers();
    setUsers(data);
  };

  const handleAddUser = async () => {
    if (!newEmail) return;

    await addUser(newEmail);
    setNewEmail('');
    const data = await fetchUsers();
    setUsers(data);
  };

  const columns = [
    { title: 'Email', dataIndex: 'id', sorter: (a, b) => { const getDomain = (email) => email.includes('@') ? email.split('@')[1] : ''; const domainA = getDomain(a.id); const domainB = getDomain(b.id); return domainA.localeCompare(domainB); }, sortDirections: ['descend', 'ascend'] },    { title: 'Paying user', dataIndex: 'isPayingUser', render: isPayingUser => isPayingUser.toString() },
    { title: 'Action', 
      render: (text, record) => (
        <div>
          <Button onClick={() => handleToggleUserStatus(record.id, record.isPayingUser)}>
            {record.isPayingUser ? 'Set Non-Paying' : 'Set Paying'}
          </Button>
          <Button onClick={() => handleDeleteUser(record.id)}>Delete User</Button>
        </div>
      )
    }
  ];


  // access control
  const emailList = ["bendik.skarpnes@gmail.com", "skjell99@gmail.com"];
  if (!user) return <Navigate to="/signup" />;
  if (!emailList.includes(user.email)) return <Navigate to="/" />;
  
  return (
    <>
      <NavBar /> 
      <div style={{margin: 10}}>
        <Table columns={columns} dataSource={users} rowKey="id" pagination={false} />
        <Input
          type="email"
          value={newEmail}
          onChange={e => setNewEmail(e.target.value)}
          placeholder="Add new paying user email"
        />
        <Button onClick={handleAddUser}>Add User</Button>
      </div>
    </>
  );
};

export default AdminPage;
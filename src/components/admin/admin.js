import React, { useEffect, useState } from 'react';
import { Navigate } from "react-router-dom";
import NavBar from '../common/navBar';
import { useUser } from "../../context/useUser";
import { Table, Button, Input } from 'antd';
import { fetchUsers, toggleUserStatus, addUser, deleteUser, fetchDomains, addDomain, deleteDomain } from "../../data/services/firestore";

function DomainManagement() {
  const [domains, setDomains] = useState([]);
  const [inputValue, setInputValue] = useState(''); // to store the input value

  useEffect(() => {
    const getDomains = async () => {
      const domains = await fetchDomains();
      setDomains(domains);
    }
    
    getDomains();
  }, [])

  const handleAddDomain = async () => {
    await addDomain(domains, inputValue);
    const updatedDomains = await fetchDomains();
    setDomains(updatedDomains);
    setInputValue('');  // clear the input field
  };

  const handleDeleteDomain = async (domain) => {
    await deleteDomain(domains, domain);
    const updatedDomains = await fetchDomains();
    setDomains(updatedDomains);
  };

  return (
    <div>
      <h1>Domain Management</h1>
      <input
        type="text"
        placeholder="Add a domain"
        value={inputValue}  // bind the input value to state
        onChange={(e) => setInputValue(e.target.value)}  // update state when input changes
      />
      <button onClick={handleAddDomain}>Add domain</button> 
      <ul>
        {domains.map((domain, index) => (
          <li key={index}>
            {domain}
            <button onClick={() => handleDeleteDomain(domain)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

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
  const emailList = ["bendik.skarpnes@gmail.com", "skjell99@gmail.com", "s222012@nhhs.no"];
  if (!user) return <Navigate to="/" />;
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
      <DomainManagement />
    </>
  );
};

export default AdminPage;
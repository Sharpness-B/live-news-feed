import { useState, useEffect } from 'react';
import { TextField, Button, Chip, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getFoldersFromDB, addFolderToDB, deleteFolderFromDB, updateFolderInDB, writeSelectedFeedsToDB } from "../../../data/services/firestore";

import './Inputs.css';

const FolderSelector = ({ user, folders, setFolders }) => {
  const [folderName, setFolderName] = useState('');

  useEffect(() => {
    const fetchFolders = async () => {
      let foldersFromDB = await getFoldersFromDB(user);
      
      // Create a default folder if there are no folders yet
      if (foldersFromDB.length === 0) {
        const defaultFolderId = await addFolderToDB(user, { name: 'Innenriks', isSelected: true });
        foldersFromDB = [{ id: defaultFolderId, name: 'Innenriks', isSelected: true }];
        // add the default select for new folders
        await writeSelectedFeedsToDB(user, defaultFolderId, [1])
      }

      setFolders(foldersFromDB);
    }

    fetchFolders();
  }, [user]);

  const handleFolderClick = async (clickedFolder) => {
    const updatedFolders = folders.map((folder) => {
      folder.isSelected = folder.id === clickedFolder.id;
      if (folder.id !== clickedFolder.id) {
        updateFolderInDB(user, folder.id, false);
      }
      return folder;
    });

    setFolders(updatedFolders);
    await updateFolderInDB(user, clickedFolder.id, true);
  };

  const handleDeleteFolder = async (folderToDelete) => {
    const updatedFolders = folders.filter((folder) => folder.id !== folderToDelete.id);
    
    // select another folder
    if (folderToDelete.isSelected) {
      updatedFolders[0].isSelected = true
      updateFolderInDB(user, updatedFolders[0].id, true);
    }

    setFolders(updatedFolders);
    await deleteFolderFromDB(user, folderToDelete.id);
  };

  const handleAddFolder = async (e) => {
    e.preventDefault();
    if (folderName) {
      const newFolder = { name: folderName, isSelected: true };
      
      // Deselect all existing folders
      const updatedFolders = folders.map(folder => {
        folder.isSelected = false;
        updateFolderInDB(user, folder.id, false);
        return folder;
      });
      
      const newFolderId = await addFolderToDB(user, newFolder);
      setFolders([...updatedFolders, { id: newFolderId, ...newFolder }]);
      setFolderName('');

      // add the default select for new folders if not paying user
      if (!user.isPayingUser) {
        await writeSelectedFeedsToDB(user, newFolderId, [1])
      }
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleAddFolder} className="form-container">
        <TextField
          label="Mappe"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          className="input-field"
          size="small"
        />
        <Button type="submit">Legg til</Button>
        <div className="chips-container">
          {folders.map((folder) => (
            <Chip
              label={folder.name}
              clickable
              color={folder.isSelected ? 'primary' : 'default'}
              onClick={() => handleFolderClick(folder)}
              // Conditionally render delete function and icon if there's more than one folder
              {...folders.length > 1 && {
                onDelete: () => handleDeleteFolder(folder),
                deleteIcon: <IconButton><DeleteIcon /></IconButton>
              }}
              key={folder.id}
              sx={{
                ...(folder.isSelected ? { borderRadius: '12px 12px 0 0' } : {}),
                ...(folder.isSelected ? { height: '50px' } : {}),
                
              }}
            />
          ))}
        </div>
      </form>
    </div>
  );
};

export default FolderSelector;
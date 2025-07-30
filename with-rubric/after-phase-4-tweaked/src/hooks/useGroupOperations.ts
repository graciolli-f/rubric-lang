import { useState } from 'react';
import { useGroupStore } from '../stores/group-store';

export function useGroupOperations() {
  const { createGroup, joinGroup, isLoading } = useGroupStore();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [joinGroupId, setJoinGroupId] = useState('');

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newGroupName.trim()) return;
    
    try {
      await createGroup(newGroupName.trim(), newGroupDescription.trim());
      setShowCreateModal(false);
      setNewGroupName('');
      setNewGroupDescription('');
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!joinGroupId.trim()) return;
    
    try {
      await joinGroup(joinGroupId.trim());
      setShowJoinModal(false);
      setJoinGroupId('');
    } catch (error) {
      // Error is handled by the store
    }
  };

  return {
    // Modal state
    showCreateModal,
    setShowCreateModal,
    showJoinModal,
    setShowJoinModal,
    
    // Form state
    newGroupName,
    setNewGroupName,
    newGroupDescription,
    setNewGroupDescription,
    joinGroupId,
    setJoinGroupId,
    
    // Operations
    handleCreateGroup,
    handleJoinGroup,
    isLoading
  };
} 
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Check, X, Users, ArrowUpRight } from 'lucide-react';
import { connectionsService } from '../services/connections';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { LoadingState } from '../components/shared/LoadingState';
import { EmptyState } from '../components/shared/EmptyState';
import { showToast } from '../utils/toast';
import type { Connection } from '../types';

export const Connections: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'connections' | 'requests'>('connections');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [requests, setRequests] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [connRes, reqRes] = await Promise.all([
        connectionsService.listConnections(),
        connectionsService.listRequests(),
      ]);
      setConnections(connRes.results);
      setRequests(reqRes.results);
    } catch (err) {
      showToast.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAccept = async (userId: number, requestId: number) => {
    setActionLoading((prev) => ({ ...prev, [requestId]: true }));
    try {
      await connectionsService.acceptRequest(userId);
      showToast.success('Connection request accepted!');
      await loadData();
    } catch (err) {
      showToast.error(err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleReject = async (userId: number, requestId: number) => {
    setActionLoading((prev) => ({ ...prev, [requestId]: true }));
    try {
      await connectionsService.rejectRequest(userId);
      showToast.success('Connection request rejected.');
      await loadData();
    } catch (err) {
      showToast.error(err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  if (isLoading) return <LoadingState type="list" count={4} />;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 font-sans text-left pb-12">
      {/* Tabs */}
      <div className="flex border-b border-gray-150">
        <button
          onClick={() => setActiveTab('connections')}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 cursor-pointer
            ${
              activeTab === 'connections'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
        >
          My Connections ({connections.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 cursor-pointer
            ${
              activeTab === 'requests'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
        >
          Pending Requests ({requests.length})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'connections' ? (
        connections.length === 0 ? (
          <EmptyState
            icon={<Users className="w-8 h-8" />}
            title="No connections yet"
            description="Your campus network starts here. Go to Discovery to find classmates!"
            actionText="Discover Students"
            onAction={() => navigate('/discover')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {connections.map((c) => {
              // The connection could have been sent by current user or other user
              // We display the details of the opposite user
              const showUser = c.sender.username === localStorage.getItem('username') ? c.receiver : c.sender;
              
              return (
                <Card
                  key={c.id}
                  onClick={() => navigate(`/profile/${showUser.id}`)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:border-gray-300"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={`${showUser.first_name} ${showUser.last_name}`} size="sm" />
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900">
                        {showUser.first_name} {showUser.last_name}
                      </h4>
                      <p className="text-xs text-gray-500">@{showUser.username}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </Card>
              );
            })}
          </div>
        )
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<UserCheck className="w-8 h-8" />}
          title="No pending requests"
          description="You do not have any incoming connection requests at the moment."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map((r) => (
            <Card key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate(`/profile/${r.sender.id}`)}
              >
                <Avatar name={`${r.sender.first_name} ${r.sender.last_name}`} size="sm" />
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">
                    {r.sender.first_name} {r.sender.last_name}
                  </h4>
                  <p className="text-xs text-gray-500">@{r.sender.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReject(r.sender.id, r.id)}
                  disabled={actionLoading[r.id]}
                  leftIcon={<X className="w-3.5 h-3.5" />}
                >
                  Reject
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAccept(r.sender.id, r.id)}
                  isLoading={actionLoading[r.id]}
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                >
                  Accept
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
export default Connections;

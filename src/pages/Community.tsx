import { useState, useEffect } from 'react';
import { Trophy, Medal, TrendingUp, UserPlus, Search, Users, Check, X, Clock, Star, Award, Flame, Target, Calendar, MessageCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';

export function Community() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [filter, setFilter] = useState<'global' | 'friends'>('global');
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'friends' | 'search'>('leaderboard');
  
  // Friends state
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // User Profile Modal state
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [profileGradient, setProfileGradient] = useState<string>('linear-gradient(135deg, rgb(74, 222, 128), rgb(34, 197, 94))');

  useEffect(() => {
    fetchLeaderboard();
    fetchFriends();
    fetchFriendRequests();

    // Setup realtime subscriptions
    const friendsSubscription = supabase
      .channel('friends-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friends',
          filter: `user_id=eq.${profile?.id}`,
        },
        (payload) => {
          console.log('Friends change detected:', payload);
          fetchFriends();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friends',
          filter: `friend_id=eq.${profile?.id}`,
        },
        (payload) => {
          console.log('Friend request change detected:', payload);
          fetchFriendRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(friendsSubscription);
    };
  }, [profile?.id]);

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, total_points, level, current_streak')
      .order('total_points', { ascending: false })
      .limit(100);

    setLeaderboard(data || []);
  };

  const fetchFriends = async () => {
    try {
      const { data: sentFriends, error: error1 } = await supabase
        .from('friends')
        .select('id, friend_id, created_at')
        .eq('user_id', profile?.id)
        .eq('status', 'accepted');

      const { data: receivedFriends, error: error2 } = await supabase
        .from('friends')
        .select('id, user_id, created_at')
        .eq('friend_id', profile?.id)
        .eq('status', 'accepted');

      if (error1 || error2) throw error1 || error2;

      const allFriendIds = [
        ...(sentFriends || []).map(f => f.friend_id),
        ...(receivedFriends || []).map(f => f.user_id)
      ];

      if (allFriendIds.length > 0) {
        const { data: friendProfiles } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, total_points, level, current_streak')
          .in('id', allFriendIds);

        const friendsWithProfiles = [
          ...(sentFriends || []).map(friendship => ({
            ...friendship,
            friend_id: friendship.friend_id,
            friend: friendProfiles?.find(p => p.id === friendship.friend_id)
          })),
          ...(receivedFriends || []).map(friendship => ({
            ...friendship,
            friend_id: friendship.user_id,
            friend: friendProfiles?.find(p => p.id === friendship.user_id)
          }))
        ];

        setFriends(friendsWithProfiles);
      } else {
        setFriends([]);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
      setFriends([]);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const { data: incoming, error: incomingError } = await supabase
        .from('friends')
        .select('id, user_id, created_at')
        .eq('friend_id', profile?.id)
        .eq('status', 'pending');

      if (incomingError) throw incomingError;

      if (incoming && incoming.length > 0) {
        const userIds = incoming.map(req => req.user_id);
        const { data: requesterProfiles } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, level')
          .in('id', userIds);

        const incomingWithProfiles = incoming.map(req => ({
          ...req,
          requester: requesterProfiles?.find(p => p.id === req.user_id)
        }));

        setFriendRequests(incomingWithProfiles);
      } else {
        setFriendRequests([]);
      }

      const { data: outgoing, error: outgoingError } = await supabase
        .from('friends')
        .select('id, friend_id, created_at')
        .eq('user_id', profile?.id)
        .eq('status', 'pending');

      if (outgoingError) throw outgoingError;

      if (outgoing && outgoing.length > 0) {
        const friendIds = outgoing.map(req => req.friend_id);
        const { data: receiverProfiles } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, level')
          .in('id', friendIds);

        const outgoingWithProfiles = outgoing.map(req => ({
          ...req,
          receiver: receiverProfiles?.find(p => p.id === req.friend_id)
        }));

        setSentRequests(outgoingWithProfiles);
      } else {
        setSentRequests([]);
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      setFriendRequests([]);
      setSentRequests([]);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    
    const { data } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, total_points, level, current_streak')
      .ilike('name', `%${searchQuery}%`)
      .neq('id', profile?.id)
      .limit(20);

    const resultsWithStatus = await Promise.all(
      (data || []).map(async (user) => {
        const { data: friendData } = await supabase
          .from('friends')
          .select('status')
          .or(`and(user_id.eq.${profile?.id},friend_id.eq.${user.id}),and(user_id.eq.${user.id},friend_id.eq.${profile?.id})`)
          .single();

        return {
          ...user,
          friendStatus: friendData?.status || 'none',
        };
      })
    );

    setSearchResults(resultsWithStatus);
    setSearching(false);
  };

  const sendFriendRequest = async (friendId: string) => {
    const { error } = await supabase
      .from('friends')
      .insert([
        {
          user_id: profile?.id,
          friend_id: friendId,
          status: 'pending',
        },
      ]);

    if (error) {
      showToast('Failed to send friend request', 'error');
    } else {
      showToast('Friend request sent!', 'success');
      searchUsers();
      fetchFriendRequests();
      if (selectedUser?.id === friendId) {
        setSelectedUser({ ...selectedUser, friendStatus: 'pending' });
      }
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    if (error) {
      showToast('Failed to accept friend request', 'error');
    } else {
      showToast('Friend request accepted!', 'success');
      await Promise.all([fetchFriends(), fetchFriendRequests()]);
    }
  };

  const declineFriendRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('id', requestId);

    if (error) {
      showToast('Failed to decline friend request', 'error');
    } else {
      showToast('Friend request declined', 'info');
      fetchFriendRequests();
    }
  };

  const removeFriend = async (friendshipId: string, friendUserId: string) => {
    const { error: error1 } = await supabase
      .from('friends')
      .delete()
      .eq('id', friendshipId);

    const { error: error2 } = await supabase
      .from('friends')
      .delete()
      .or(`and(user_id.eq.${profile?.id},friend_id.eq.${friendUserId}),and(user_id.eq.${friendUserId},friend_id.eq.${profile?.id})`);

    if (error1 && error2) {
      showToast('Failed to remove friend', 'error');
    } else {
      showToast('Friend removed', 'info');
      fetchFriends();
      if (selectedUser?.id === friendUserId) {
        setSelectedUser({ ...selectedUser, friendStatus: 'none' });
      }
    }
  };

  const extractDominantColor = (imageUrl: string) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let r = 0, g = 0, b = 0;
        let count = 0;
        
        // Sample pixels (every 10th pixel for performance)
        for (let i = 0; i < data.length; i += 40) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
        
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);
        
        // Generate gradient colors - lighter and darker versions
        const color1 = `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)})`;
        const color2 = `rgb(${Math.max(0, r - 20)}, ${Math.max(0, g - 20)}, ${Math.max(0, b - 20)})`;
        
        setProfileGradient(`linear-gradient(135deg, ${color1}, ${color2})`);
      } catch (error) {
        // Fallback if CORS issues
        console.log('CORS error, using default gradient');
        setProfileGradient('linear-gradient(135deg, rgb(74, 222, 128), rgb(34, 197, 94))');
      }
    };
    
    img.onerror = () => {
      setProfileGradient('linear-gradient(135deg, rgb(74, 222, 128), rgb(34, 197, 94))');
    };
  };

  const openUserProfile = async (user: any) => {
    // Check friend status
    const { data: friendData } = await supabase
      .from('friends')
      .select('id, status')
      .or(`and(user_id.eq.${profile?.id},friend_id.eq.${user.id}),and(user_id.eq.${user.id},friend_id.eq.${profile?.id})`)
      .single();

    setSelectedUser({
      ...user,
      friendStatus: friendData?.status || 'none',
      friendshipId: friendData?.id || null
    });
    
    // Extract dominant color from avatar
    if (user.avatar_url) {
      extractDominantColor(user.avatar_url);
    } else {
      setProfileGradient('linear-gradient(135deg, rgb(74, 222, 128), rgb(34, 197, 94))');
    }
    
    setShowUserModal(true);
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Medal className="w-6 h-6 text-orange-600" />;
    return null;
  };

  const getAvatar = (user: any) => {
    if (user.avatar_url) {
      return (
        <img
          src={user.avatar_url}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover"
        />
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-semibold">
        {user.name?.charAt(0).toUpperCase() || 'U'}
      </div>
    );
  };

  const getLargeAvatar = (user: any) => {
    if (user.avatar_url) {
      return (
        <img
          src={user.avatar_url}
          alt={user.name}
          className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
        />
      );
    }
    return (
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-3xl border-4 border-white dark:border-gray-800 shadow-lg">
        {user.name?.charAt(0).toUpperCase() || 'U'}
      </div>
    );
  };

  const userRank = leaderboard.findIndex((user) => user.id === profile?.id) + 1;
  const displayedLeaderboard = filter === 'friends' 
    ? leaderboard.filter(user => friends.some(f => f.friend.id === user.id))
    : leaderboard;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Community</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Connect with others and compete on the leaderboard
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'leaderboard'
              ? 'text-[#4CAF50] border-b-2 border-[#4CAF50]'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Trophy className="inline w-5 h-5 mr-2" />
          Leaderboard
        </button>
        <button
          onClick={() => setActiveTab('friends')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeTab === 'friends'
              ? 'text-[#4CAF50] border-b-2 border-[#4CAF50]'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Users className="inline w-5 h-5 mr-2" />
          Friends
          {friendRequests.length > 0 && (
            <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {friendRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'search'
              ? 'text-[#4CAF50] border-b-2 border-[#4CAF50]'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Search className="inline w-5 h-5 mr-2" />
          Find Friends
        </button>
      </div>

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <>
          {userRank > 0 && (
            <Card className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your Rank</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">#{userRank}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your Points</p>
                    <p className="text-3xl font-bold text-[#4CAF50]">{profile?.total_points || 0}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-[#4CAF50]" />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4">
            <Button
              variant={filter === 'global' ? 'primary' : 'outline'}
              onClick={() => setFilter('global')}
            >
              Global
            </Button>
            <Button
              variant={filter === 'friends' ? 'primary' : 'outline'}
              onClick={() => setFilter('friends')}
            >
              Friends Only
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {filter === 'global' ? 'Top 100 Users' : 'Friends Leaderboard'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {displayedLeaderboard.slice(0, 20).map((user, index) => (
                  <div
                    key={user.id}
                    onClick={() => user.id !== profile?.id && openUserProfile(user)}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                      user.id === profile?.id
                        ? 'bg-green-100 dark:bg-green-900/20'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer hover:shadow-md hover:scale-[1.02]'
                    }`}
                  >
                    <div className="w-8 text-center font-bold text-gray-600 dark:text-gray-400">
                      {getRankIcon(index) || `#${index + 1}`}
                    </div>
                    {getAvatar(user)}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {user.name}
                        {user.id === profile?.id && (
                          <Badge variant="success" className="ml-2">
                            You
                          </Badge>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Level {user.level} • {user.current_streak} day streak
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#4CAF50]">{user.total_points}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <>
          {friendRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Friend Requests ({friendRequests.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {friendRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                    >
                      {getAvatar(request.requester)}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {request.requester.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Level {request.requester.level}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          onClick={() => acceptFriendRequest(request.id)}
                          className="flex items-center gap-2"
                        >
                          <Check size={16} />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => declineFriendRequest(request.id)}
                          className="flex items-center gap-2"
                        >
                          <X size={16} />
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {sentRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Requests ({sentRequests.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      {getAvatar(request.receiver)}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {request.receiver.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Level {request.receiver.level}
                        </p>
                      </div>
                      <Badge variant="warning" className="flex items-center gap-1">
                        <Clock size={14} />
                        Pending
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>My Friends ({friends.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {friends.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">No friends yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                    Start by searching and adding friends!
                  </p>
                  <Button variant="primary" onClick={() => setActiveTab('search')}>
                    Find Friends
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {friends.map((friendship) => (
                    <div
                      key={friendship.id}
                      onClick={() => openUserProfile(friendship.friend)}
                      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all cursor-pointer hover:shadow-md hover:scale-[1.02]"
                    >
                      {getAvatar(friendship.friend)}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {friendship.friend.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Level {friendship.friend.level} • {friendship.friend.current_streak} day streak • {friendship.friend.total_points} XP
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && (
        <Card>
          <CardHeader>
            <CardTitle>Find Friends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                  icon={<Search size={20} />}
                />
                <Button
                  variant="primary"
                  onClick={searchUsers}
                  isLoading={searching}
                >
                  Search
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-3">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => openUserProfile(user)}
                      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all cursor-pointer hover:shadow-md hover:scale-[1.02]"
                    >
                      {getAvatar(user)}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Level {user.level} • {user.current_streak} day streak • {user.total_points} XP
                        </p>
                      </div>
                      {user.friendStatus === 'none' && (
                        <UserPlus className="w-5 h-5 text-[#4CAF50]" />
                      )}
                      {user.friendStatus === 'pending' && (
                        <Badge variant="warning" className="flex items-center gap-1">
                          <Clock size={14} />
                          Pending
                        </Badge>
                      )}
                      {user.friendStatus === 'accepted' && (
                        <Badge variant="success" className="flex items-center gap-1">
                          <Check size={14} />
                          Friends
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {searchQuery && searchResults.length === 0 && !searching && (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">No users found</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Try searching with a different name
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Profile Modal */}
      {showUserModal && selectedUser && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowUserModal(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with dynamic gradient background */}
            <div 
              className="p-6 relative"
              style={{ background: profileGradient }}
            >
              <button
                onClick={() => setShowUserModal(false)}
                className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="flex flex-col items-center">
                {getLargeAvatar(selectedUser)}
                <h2 className="text-2xl font-bold text-white mt-4">{selectedUser.name}</h2>
                <div className="flex gap-2 mt-2">
                  <Badge variant="success" className="bg-white/20 text-white border-white/30">
                    Level {selectedUser.level}
                  </Badge>
                  <Badge variant="info" className="bg-white/20 text-white border-white/30">
                    Rank #{leaderboard.findIndex(u => u.id === selectedUser.id) + 1}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 dark:bg-gray-700/50">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedUser.total_points}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total XP</p>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedUser.current_streak}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Day Streak</p>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedUser.level}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Level</p>
              </div>
            </div>

            {/* Achievements Preview */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#4CAF50]" />
                Recent Achievements
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <div className="flex-shrink-0 p-3 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <Target className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-shrink-0 p-3 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border border-green-200 dark:border-green-800">
                  <Flame className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 space-y-3">
              {selectedUser.friendStatus === 'none' && (
                <Button
                  variant="primary"
                  onClick={() => sendFriendRequest(selectedUser.id)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <UserPlus size={18} />
                  Add Friend
                </Button>
              )}
              
              {selectedUser.friendStatus === 'pending' && (
                <div className="flex items-center justify-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-700 dark:text-yellow-400">
                  <Clock size={18} />
                  <span className="font-medium">Friend Request Pending</span>
                </div>
              )}
              
              {selectedUser.friendStatus === 'accepted' && (
                <>
                  <div className="flex items-center justify-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400 mb-3">
                    <Check size={18} />
                    <span className="font-medium">You are friends</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        showToast('Message feature coming soon!', 'info');
                      }}
                      className="flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={16} />
                      Message
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (confirm('Are you sure you want to remove this friend?')) {
                          removeFriend(selectedUser.friendshipId, selectedUser.id);
                          setShowUserModal(false);
                        }
                      }}
                      className="flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:border-red-600"
                    >
                      <X size={16} />
                      Remove
                    </Button>
                  </div>
                </>
              )}
              
              <Button
                variant="outline"
                onClick={() => setShowUserModal(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Stories */}
      {activeTab === 'leaderboard' && (
        <Card>
          <CardHeader>
            <CardTitle>Success Stories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    S
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">Bapak Perkasa Gadik Puriadi, M.Pd</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      "I've reduced my food waste by 60% in just 3 months! FOOPTRA helped me understand my patterns and make better choices."
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="success">60% Reduction</Badge>
                      <Badge variant="info">90 Day Streak</Badge>
                      <Badge variant="warning">Level 15</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    A
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">Ibu Ayu Lestari</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      "Tracking my meals became a fun habit! The gamification features keep me motivated every day."
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="success">45% Less Waste</Badge>
                      <Badge variant="info">60 Day Streak</Badge>
                      <Badge variant="warning">Level 12</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    R
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">Rudi Hermawan</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      "Competing with friends made waste reduction enjoyable. We challenge each other to improve!"
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="success">70% Reduction</Badge>
                      <Badge variant="info">120 Day Streak</Badge>
                      <Badge variant="warning">Level 18</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
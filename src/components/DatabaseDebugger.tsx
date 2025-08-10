import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useIndividualAuth } from '@/hooks/useIndividualAuth';

export const DatabaseDebugger = () => {
  const { user } = useIndividualAuth();
  const [purchases, setPurchases] = useState([]);
  const [oneOnOneSessions, setOneOnOneSessions] = useState([]);
  const [shortPrograms, setShortPrograms] = useState([]);
  const [financialTools, setFinancialTools] = useState([]);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    try {
      // Fetch purchases
      const { data: purchasesData } = await supabase
        .from('individual_purchases')
        .select('*')
        .eq('user_id', user.id);

      // Fetch sessions
      const { data: sessionsData } = await supabase
        .from('one_on_one_sessions')
        .select('*')
        .eq('is_active', true);

      // Fetch programs
      const { data: programsData } = await supabase
        .from('short_programs')
        .select('*')
        .eq('is_active', true);

      // Fetch tools
      const { data: toolsData } = await supabase
        .from('financial_tools')
        .select('*')
        .eq('is_active', true);

      setPurchases(purchasesData || []);
      setOneOnOneSessions(sessionsData || []);
      setShortPrograms(programsData || []);
      setFinancialTools(toolsData || []);

      console.log('Debug Data:', {
        purchases: purchasesData,
        sessions: sessionsData?.slice(0, 3),
        programs: programsData?.slice(0, 3),
        tools: toolsData?.slice(0, 3)
      });
    } catch (error) {
      console.error('Error fetching debug data:', error);
    }
  };

  if (!user) return null;

  const getPurchaseStatus = (itemId: string, itemType: string) => {
    const purchase = purchases.find(p => 
      p.item_id === itemId && 
      p.item_type === itemType && 
      p.status === 'purchased'
    );
    return purchase ? 'PURCHASED' : 'NOT PURCHASED';
  };

  return (
    <div className="space-y-4 mb-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Database Debug Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Purchases Debug */}
          <div>
            <h4 className="font-semibold text-sm mb-2">Your Purchases ({purchases.length})</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {purchases.map((purchase, index) => (
                <div key={index} className="text-xs bg-gray-100 p-2 rounded">
                  <div>ID: {purchase.item_id}</div>
                  <div>Type: {purchase.item_type}</div>
                  <div>Status: {purchase.status}</div>
                  <div>Amount: ₹{purchase.amount_paid}</div>
                </div>
              ))}
              {purchases.length === 0 && (
                <div className="text-xs text-gray-500">No purchases found</div>
              )}
            </div>
          </div>

          {/* Sample Sessions Debug */}
          <div>
            <h4 className="font-semibold text-sm mb-2">Sample Sessions Status</h4>
            <div className="space-y-1 text-xs">
              {oneOnOneSessions.slice(0, 3).map((session) => (
                <div key={session.id} className="bg-blue-50 p-2 rounded">
                  <div>{session.title}</div>
                  <div>ID: {session.id}</div>
                  <div className="font-semibold">
                    Status: {getPurchaseStatus(session.id, 'one_on_one')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Refresh Button */}
          <button 
            onClick={fetchAllData}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            Refresh Data
          </button>
        </CardContent>
      </Card>
    </div>
  );
};
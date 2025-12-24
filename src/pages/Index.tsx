import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

type Crypto = {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  balance: number;
};

type User = {
  id: string;
  username: string;
  email: string;
  balance: number;
  isPremium: boolean;
  walletId: string;
  loginBonus: number;
};

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [cryptos, setCryptos] = useState<Crypto[]>([
    { id: '1', name: 'Bitcoin', symbol: 'BTC', price: 45230.50, change: 2.5, balance: 0 },
    { id: '2', name: 'Ethereum', symbol: 'ETH', price: 2890.75, change: -1.2, balance: 0 },
    { id: '3', name: 'Tether', symbol: 'USDT', price: 1.00, change: 0.01, balance: 0 },
  ]);
  const [selectedCrypto, setSelectedCrypto] = useState<Crypto>(cryptos[0]);
  const [tradeAmount, setTradeAmount] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoCodes] = useState([
    { code: 'WELCOME100', bonus: 100, type: 'USD' },
    { code: 'CRYPTO50', bonus: 50, type: 'USDT' },
  ]);
  const [calendarDays, setCalendarDays] = useState<number[]>([]);
  const [currentDay, setCurrentDay] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setCryptos(prev => prev.map(crypto => ({
        ...crypto,
        price: crypto.price * (1 + (Math.random() - 0.5) * 0.02),
        change: (Math.random() - 0.5) * 5
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (email: string, password: string) => {
    const newUser: User = {
      id: `USR${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      username: email.split('@')[0],
      email,
      balance: Math.floor(Math.random() * 100) + 200,
      isPremium: false,
      walletId: `WALLET${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      loginBonus: 250
    };
    setCurrentUser(newUser);
    setIsLoggedIn(true);
    toast.success(`Добро пожаловать! Бонус +$${newUser.loginBonus}`);
  };

  const handleDemoMode = () => {
    const demoUser: User = {
      id: 'DEMO',
      username: 'Demo User',
      email: 'demo@trading.com',
      balance: 1000,
      isPremium: false,
      walletId: 'DEMO_WALLET',
      loginBonus: 0
    };
    setCurrentUser(demoUser);
    setIsDemoMode(true);
    setIsLoggedIn(true);
    toast.info('Демо-режим активирован с балансом $1000');
  };

  const handleTrade = (action: 'buy' | 'sell') => {
    if (!currentUser || !tradeAmount) return;
    
    const amount = parseFloat(tradeAmount);
    const totalCost = amount * selectedCrypto.price;

    if (action === 'buy') {
      if (currentUser.balance < totalCost) {
        toast.error('Недостаточно средств');
        return;
      }
      setCurrentUser({
        ...currentUser,
        balance: currentUser.balance - totalCost
      });
      setCryptos(prev => prev.map(c => 
        c.id === selectedCrypto.id ? { ...c, balance: c.balance + amount } : c
      ));
      toast.success(`Куплено ${amount} ${selectedCrypto.symbol}`);
    } else {
      const currentCrypto = cryptos.find(c => c.id === selectedCrypto.id);
      if (!currentCrypto || currentCrypto.balance < amount) {
        toast.error('Недостаточно криптовалюты');
        return;
      }
      setCurrentUser({
        ...currentUser,
        balance: currentUser.balance + totalCost
      });
      setCryptos(prev => prev.map(c => 
        c.id === selectedCrypto.id ? { ...c, balance: c.balance - amount } : c
      ));
      toast.success(`Продано ${amount} ${selectedCrypto.symbol}`);
    }
    setTradeAmount('');
  };

  const handleBuyPremium = () => {
    if (!currentUser) return;
    if (currentUser.balance < 99.99) {
      toast.error('Недостаточно средств для покупки премиума');
      return;
    }
    setCurrentUser({
      ...currentUser,
      balance: currentUser.balance - 99.99,
      isPremium: true
    });
    toast.success('⭐ Премиум активирован! +15% к профиту');
  };

  const handleClaimCalendar = () => {
    if (calendarDays.includes(currentDay)) {
      toast.error('Награда уже получена');
      return;
    }
    const reward = Math.floor(Math.random() * 50) + 50;
    setCalendarDays([...calendarDays, currentDay]);
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        balance: currentUser.balance + reward
      });
    }
    toast.success(`День ${currentDay}: +$${reward}`);
  };

  const handlePromoCode = () => {
    const promo = promoCodes.find(p => p.code === promoCode.toUpperCase());
    if (!promo) {
      toast.error('Промокод не найден');
      return;
    }
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        balance: currentUser.balance + promo.bonus
      });
    }
    toast.success(`Промокод активирован! +${promo.bonus} ${promo.type}`);
    setPromoCode('');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-card border-2 border-primary/20 animate-slide-up">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-primary neon-text-green mb-2">CryptoTrade</h1>
            <p className="text-muted-foreground">Торговая платформа будущего</p>
          </div>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleLogin(formData.get('email') as string, formData.get('password') as string);
              }} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="user@example.com" required />
                </div>
                <div>
                  <Label htmlFor="password">Пароль</Label>
                  <Input id="password" name="password" type="password" placeholder="••••••••" required />
                </div>
                <Button type="submit" className="w-full neon-glow-green">
                  <Icon name="LogIn" className="mr-2" size={18} />
                  Войти
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleLogin(formData.get('email') as string, formData.get('password') as string);
              }} className="space-y-4">
                <div>
                  <Label htmlFor="reg-email">Email</Label>
                  <Input id="reg-email" name="email" type="email" placeholder="user@example.com" required />
                </div>
                <div>
                  <Label htmlFor="reg-password">Пароль</Label>
                  <Input id="reg-password" name="password" type="password" placeholder="••••••••" required />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Подтвердите пароль</Label>
                  <Input id="confirm-password" name="confirm" type="password" placeholder="••••••••" required />
                </div>
                <Button type="submit" className="w-full neon-glow-blue bg-secondary hover:bg-secondary/90">
                  <Icon name="UserPlus" className="mr-2" size={18} />
                  Зарегистрироваться
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Бонус $200-300 за регистрацию!
                </p>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <Button variant="outline" className="w-full" onClick={handleDemoMode}>
              <Icon name="Play" className="mr-2" size={18} />
              Демо-режим
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <header className="border-b border-primary/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-black text-primary neon-text-green">CryptoTrade</h1>
            {isDemoMode && <Badge variant="secondary">DEMO</Badge>}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Баланс</p>
              <p className="text-xl font-bold text-accent">${currentUser?.balance.toFixed(2)}</p>
            </div>
            {currentUser?.isPremium && <span className="text-2xl animate-pulse-glow">⭐</span>}
            <Button variant="ghost" size="icon">
              <Icon name="User" size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 border-2 border-primary/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold">{selectedCrypto.name}</h2>
                  <p className="text-muted-foreground">{selectedCrypto.symbol}</p>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-bold ${selectedCrypto.change > 0 ? 'text-primary animate-price-up' : 'text-destructive animate-price-down'}`}>
                    ${selectedCrypto.price.toFixed(2)}
                  </p>
                  <Badge variant={selectedCrypto.change > 0 ? 'default' : 'destructive'} className={selectedCrypto.change > 0 ? 'neon-glow-green' : 'neon-glow-red'}>
                    <Icon name={selectedCrypto.change > 0 ? 'TrendingUp' : 'TrendingDown'} size={14} className="mr-1" />
                    {selectedCrypto.change > 0 ? '+' : ''}{selectedCrypto.change.toFixed(2)}%
                  </Badge>
                </div>
              </div>

              <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center mb-6 border border-primary/10">
                <div className="text-center">
                  <Icon name="Activity" size={48} className="mx-auto mb-2 text-primary animate-pulse-glow" />
                  <p className="text-muted-foreground">График цены {selectedCrypto.symbol}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <Label htmlFor="amount">Количество</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    step="0.0001"
                    placeholder="0.00"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Стоимость</Label>
                  <Input 
                    type="text" 
                    value={tradeAmount ? `$${(parseFloat(tradeAmount) * selectedCrypto.price).toFixed(2)}` : '$0.00'}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => handleTrade('buy')}
                  className="neon-glow-green"
                  disabled={!tradeAmount || parseFloat(tradeAmount) <= 0}
                >
                  <Icon name="ArrowUp" className="mr-2" size={18} />
                  Купить
                </Button>
                <Button 
                  onClick={() => handleTrade('sell')}
                  variant="destructive"
                  className="neon-glow-red"
                  disabled={!tradeAmount || parseFloat(tradeAmount) <= 0 || selectedCrypto.balance === 0}
                >
                  <Icon name="ArrowDown" className="mr-2" size={18} />
                  Продать
                </Button>
              </div>

              {selectedCrypto.balance === 0 && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Торговля невозможна - баланс {selectedCrypto.symbol} равен 0
                </p>
              )}
            </Card>

            <div className="grid grid-cols-3 gap-4">
              {cryptos.map(crypto => (
                <Card 
                  key={crypto.id}
                  className={`p-4 cursor-pointer transition-all hover:scale-105 ${selectedCrypto.id === crypto.id ? 'border-2 border-primary neon-glow-blue' : 'border border-border'}`}
                  onClick={() => setSelectedCrypto(crypto)}
                >
                  <p className="font-semibold">{crypto.symbol}</p>
                  <p className="text-sm text-muted-foreground">${crypto.price.toFixed(2)}</p>
                  <p className={`text-xs ${crypto.change > 0 ? 'text-primary' : 'text-destructive'}`}>
                    {crypto.change > 0 ? '+' : ''}{crypto.change.toFixed(2)}%
                  </p>
                  {crypto.balance > 0 && (
                    <p className="text-xs text-accent mt-1">В кошельке: {crypto.balance.toFixed(4)}</p>
                  )}
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-6 border-2 border-accent/20">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Icon name="User" className="mr-2" size={20} />
                Аккаунт
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID игрока:</span>
                  <span className="font-mono">{currentUser?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID кошелька:</span>
                  <span className="font-mono">{currentUser?.walletId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Статус:</span>
                  <span>{currentUser?.isPremium ? '⭐ Premium' : 'Обычный'}</span>
                </div>
              </div>
            </Card>

            {!currentUser?.isPremium && (
              <Card className="p-6 border-2 border-accent/20 bg-gradient-to-br from-accent/10 to-transparent">
                <h3 className="text-xl font-bold mb-2 flex items-center text-accent">
                  ⭐ Premium
                </h3>
                <p className="text-sm text-muted-foreground mb-4">+15% к профиту на всех сделках</p>
                <Button onClick={handleBuyPremium} className="w-full bg-accent hover:bg-accent/90 text-black neon-glow-blue">
                  Купить за $99.99
                </Button>
              </Card>
            )}

            <Card className="p-6 border-2 border-primary/20">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Icon name="Gift" className="mr-2" size={20} />
                Промокод
              </h3>
              <div className="space-y-3">
                <Input 
                  placeholder="Введите промокод"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                />
                <Button onClick={handlePromoCode} className="w-full" variant="outline">
                  Активировать
                </Button>
                <div className="space-y-2">
                  {promoCodes.map((promo, i) => (
                    <div key={i} className="text-xs bg-muted p-2 rounded">
                      <span className="font-mono">{promo.code}</span> - {promo.bonus} {promo.type}
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 border-secondary/20">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Icon name="Calendar" className="mr-2" size={20} />
                Адвент-календарь
              </h3>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                  <button
                    key={day}
                    onClick={() => {
                      setCurrentDay(day);
                      handleClaimCalendar();
                    }}
                    className={`aspect-square rounded text-sm font-semibold transition-all ${
                      calendarDays.includes(day) 
                        ? 'bg-primary text-black neon-glow-green' 
                        : 'bg-muted hover:bg-muted/70'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Ежедневные награды $50-100
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;

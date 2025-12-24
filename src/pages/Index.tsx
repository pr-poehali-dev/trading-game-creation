import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

type Crypto = {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  balance: number;
  history: number[];
};

type Wallet = {
  USD: number;
  RUB: number;
  EUR: number;
  CNY: number;
  BYN: number;
};

type User = {
  id: string;
  username: string;
  email: string;
  balance: number;
  wallets: Wallet;
  isPremium: boolean;
  walletId: string;
  loginBonus: number;
  taxOwed: number;
};

type PromoCode = {
  code: string;
  bonus: number;
  type: string;
  createdBy?: string;
  used?: boolean;
};

const EXCHANGE_RATES = {
  USD: 1,
  RUB: 92,
  EUR: 0.92,
  CNY: 7.2,
  BYN: 3.2
};

const PREMIUM_PRICES = {
  USD: 99.99,
  RUB: 9199,
  EUR: 91.99,
  CNY: 719,
  BYN: 319
};

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [cryptos, setCryptos] = useState<Crypto[]>([
    { id: '1', name: 'Bitcoin', symbol: 'BTC', price: 45230.50, change: 2.5, balance: 0, history: [45000, 45100, 45050, 45200, 45230] },
    { id: '2', name: 'Ethereum', symbol: 'ETH', price: 2890.75, change: -1.2, balance: 0, history: [2900, 2920, 2910, 2895, 2890] },
    { id: '3', name: 'Tether', symbol: 'USDT', price: 1.00, change: 0.01, balance: 0, history: [1.00, 1.00, 1.00, 1.00, 1.00] },
    { id: '4', name: 'Cardano', symbol: 'ADA', price: 0.52, change: 3.8, balance: 0, history: [0.50, 0.51, 0.505, 0.515, 0.52] },
    { id: '5', name: 'Solana', symbol: 'SOL', price: 102.45, change: -2.1, balance: 0, history: [105, 104, 103.5, 103, 102.45] },
  ]);
  const [selectedCrypto, setSelectedCrypto] = useState<Crypto>(cryptos[0]);
  const [tradeAmount, setTradeAmount] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [myPromoCodes, setMyPromoCodes] = useState<PromoCode[]>([
    { code: 'WELCOME100', bonus: 100, type: 'USD' },
    { code: 'CRYPTO50', bonus: 50, type: 'USDT' },
  ]);
  const [usedPromoCodes, setUsedPromoCodes] = useState<PromoCode[]>([]);
  const [calendarDays, setCalendarDays] = useState<number[]>([]);
  const [currentDay, setCurrentDay] = useState(1);
  
  const [depositAmount, setDepositAmount] = useState('');
  const [depositCurrency, setDepositCurrency] = useState<keyof Wallet>('USD');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferCrypto, setTransferCrypto] = useState('BTC');
  
  const [shopAmount, setShopAmount] = useState('');
  const [shopCrypto, setShopCrypto] = useState('BTC');
  const [shopWalletId, setShopWalletId] = useState('');
  
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoBonus, setNewPromoBonus] = useState('');
  const [newPromoType, setNewPromoType] = useState('USD');
  
  const [taxPaymentAmount, setTaxPaymentAmount] = useState('');
  const [taxPaymentCurrency, setTaxPaymentCurrency] = useState<keyof Wallet>('USD');
  
  const [premiumCurrency, setPremiumCurrency] = useState<keyof Wallet>('USD');

  useEffect(() => {
    const interval = setInterval(() => {
      setCryptos(prev => prev.map(crypto => {
        const newPrice = crypto.price * (1 + (Math.random() - 0.5) * 0.02);
        const newChange = (Math.random() - 0.5) * 5;
        return {
          ...crypto,
          price: newPrice,
          change: newChange,
          history: [...crypto.history.slice(1), newPrice]
        };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (email: string, password: string) => {
    const newUser: User = {
      id: `USR${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      username: email.split('@')[0],
      email,
      balance: Math.floor(Math.random() * 100) + 200,
      wallets: { USD: 500, RUB: 10000, EUR: 450, CNY: 3500, BYN: 1500 },
      isPremium: false,
      walletId: `WALLET${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      loginBonus: 250,
      taxOwed: 0
    };
    setCurrentUser(newUser);
    setIsLoggedIn(true);
    toast.success(`Добро пожаловать! Бонус +$${newUser.loginBonus}`);
  };

  const handleDemoMode = () => {
    const demoUser: User = {
      id: 'DEMO_USER',
      username: 'Demo User',
      email: 'demo@trading.com',
      balance: 1000,
      wallets: { USD: 1000, RUB: 92000, EUR: 920, CNY: 7200, BYN: 3200 },
      isPremium: false,
      walletId: 'DEMO_WALLET',
      loginBonus: 0,
      taxOwed: 0
    };
    setCurrentUser(demoUser);
    setIsDemoMode(true);
    setIsLoggedIn(true);
    toast.info('Демо-режим активирован с балансом $1000');
  };

  const handleTrade = (action: 'buy' | 'sell') => {
    if (!currentUser || !tradeAmount) return;
    
    const amount = parseFloat(tradeAmount);
    let totalCost = amount * selectedCrypto.price;
    
    if (currentUser.isPremium && action === 'sell') {
      totalCost *= 1.10;
    }

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
      const profit = currentUser.isPremium ? ' (+10% премиум бонус!)' : '';
      toast.success(`Продано ${amount} ${selectedCrypto.symbol}${profit}`);
    }
    setTradeAmount('');
  };

  const handleDeposit = () => {
    if (!currentUser || !depositAmount) return;
    const amount = parseFloat(depositAmount);
    if (amount <= 0 || amount > 100000) {
      toast.error('Сумма должна быть от 0 до 100,000');
      return;
    }
    
    setCurrentUser({
      ...currentUser,
      wallets: {
        ...currentUser.wallets,
        [depositCurrency]: currentUser.wallets[depositCurrency] + amount
      },
      balance: currentUser.balance + (amount / EXCHANGE_RATES[depositCurrency])
    });
    toast.success(`Пополнено ${amount} ${depositCurrency}`);
    setDepositAmount('');
  };

  const handleTransfer = () => {
    if (!currentUser || !transferAmount || !transferRecipient) return;
    const amount = parseFloat(transferAmount);
    const crypto = cryptos.find(c => c.symbol === transferCrypto);
    if (!crypto || crypto.balance < amount) {
      toast.error('Недостаточно криптовалюты для перевода');
      return;
    }
    
    setCryptos(prev => prev.map(c => 
      c.symbol === transferCrypto ? { ...c, balance: c.balance - amount } : c
    ));
    toast.success(`Переведено ${amount} ${transferCrypto} → ${transferRecipient}`);
    setTransferAmount('');
    setTransferRecipient('');
  };

  const handleShopPurchase = () => {
    if (!currentUser || !shopAmount || !shopWalletId) return;
    const amount = parseFloat(shopAmount);
    const crypto = cryptos.find(c => c.symbol === shopCrypto);
    if (!crypto) return;
    
    const totalCost = amount * crypto.price;
    if (currentUser.balance < totalCost) {
      toast.error('Недостаточно средств');
      return;
    }

    if (shopWalletId !== currentUser.walletId) {
      toast.error('ID кошелька не совпадает');
      return;
    }
    
    setCurrentUser({
      ...currentUser,
      balance: currentUser.balance - totalCost
    });
    setCryptos(prev => prev.map(c => 
      c.symbol === shopCrypto ? { ...c, balance: c.balance + amount } : c
    ));
    toast.success(`Куплено ${amount} ${shopCrypto} в магазине`);
    setShopAmount('');
  };

  const handleCreatePromo = () => {
    if (!currentUser || !newPromoCode || !newPromoBonus) return;
    const bonus = parseFloat(newPromoBonus);
    const commission = bonus * 0.015;
    
    if (currentUser.balance < commission) {
      toast.error(`Недостаточно средств. Комиссия: $${commission.toFixed(2)} (1.5%)`);
      return;
    }
    
    const newPromo: PromoCode = {
      code: newPromoCode.toUpperCase(),
      bonus,
      type: newPromoType,
      createdBy: currentUser.id
    };
    
    setMyPromoCodes([...myPromoCodes, newPromo]);
    setCurrentUser({
      ...currentUser,
      balance: currentUser.balance - commission,
      taxOwed: currentUser.taxOwed + commission
    });
    toast.success(`Промокод ${newPromo.code} создан! Комиссия: $${commission.toFixed(2)}`);
    setNewPromoCode('');
    setNewPromoBonus('');
  };

  const handleUsePromo = () => {
    const promo = myPromoCodes.find(p => p.code === promoCode.toUpperCase());
    if (!promo) {
      toast.error('Промокод не найден');
      return;
    }
    if (promo.used) {
      toast.error('Промокод уже использован');
      return;
    }
    
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        balance: currentUser.balance + promo.bonus
      });
      setMyPromoCodes(prev => prev.map(p => 
        p.code === promo.code ? { ...p, used: true } : p
      ));
      setUsedPromoCodes([...usedPromoCodes, { ...promo, used: true }]);
    }
    toast.success(`Промокод активирован! +${promo.bonus} ${promo.type}`);
    setPromoCode('');
  };

  const handlePayTax = () => {
    if (!currentUser || !taxPaymentAmount) return;
    const amount = parseFloat(taxPaymentAmount);
    const wallet = currentUser.wallets[taxPaymentCurrency];
    
    if (wallet < amount) {
      toast.error(`Недостаточно ${taxPaymentCurrency}`);
      return;
    }
    
    setCurrentUser({
      ...currentUser,
      wallets: {
        ...currentUser.wallets,
        [taxPaymentCurrency]: wallet - amount
      },
      taxOwed: Math.max(0, currentUser.taxOwed - (amount / EXCHANGE_RATES[taxPaymentCurrency]))
    });
    toast.success(`Оплачено ${amount} ${taxPaymentCurrency} налогов`);
    setTaxPaymentAmount('');
  };

  const handleBuyPremium = () => {
    if (!currentUser) return;
    const price = PREMIUM_PRICES[premiumCurrency];
    const wallet = currentUser.wallets[premiumCurrency];
    
    if (wallet < price) {
      toast.error(`Недостаточно ${premiumCurrency}. Требуется: ${price}`);
      return;
    }
    
    setCurrentUser({
      ...currentUser,
      wallets: {
        ...currentUser.wallets,
        [premiumCurrency]: wallet - price
      },
      isPremium: true
    });
    toast.success('⭐ Премиум активирован! +10% к профиту');
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
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Icon name="User" size={20} />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Мои кошельки</DialogTitle>
                  <DialogDescription>Балансы в разных валютах</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  {Object.entries(currentUser?.wallets || {}).map(([currency, amount]) => (
                    <div key={currency} className="flex justify-between items-center p-3 bg-muted rounded">
                      <span className="font-semibold">{currency}</span>
                      <span className="text-accent">{amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
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

              <div className="h-64 bg-muted/20 rounded-lg mb-6 border border-primary/10 p-4">
                <div className="h-full flex items-end justify-between gap-1">
                  {selectedCrypto.history.map((price, idx) => {
                    const maxPrice = Math.max(...selectedCrypto.history);
                    const minPrice = Math.min(...selectedCrypto.history);
                    const height = ((price - minPrice) / (maxPrice - minPrice)) * 100;
                    return (
                      <div key={idx} className="flex-1 flex flex-col justify-end">
                        <div 
                          className={`w-full rounded-t transition-all duration-300 ${
                            idx === selectedCrypto.history.length - 1 
                              ? 'bg-primary neon-glow-green' 
                              : 'bg-primary/50'
                          }`}
                          style={{ height: `${height}%` }}
                        />
                      </div>
                    );
                  })}
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
                  Продать {currentUser?.isPremium && '+10%'}
                </Button>
              </div>
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

            <Tabs defaultValue="deposit" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="deposit">Пополнение</TabsTrigger>
                <TabsTrigger value="transfer">Перевод</TabsTrigger>
                <TabsTrigger value="shop">Магазин</TabsTrigger>
              </TabsList>

              <TabsContent value="deposit" className="mt-6">
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <Icon name="Wallet" className="mr-2" size={20} />
                    Пополнить кошелек
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Валюта</Label>
                      <Select value={depositCurrency} onValueChange={(v) => setDepositCurrency(v as keyof Wallet)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD 🇺🇸</SelectItem>
                          <SelectItem value="RUB">RUB 🇷🇺</SelectItem>
                          <SelectItem value="EUR">EUR 🇪🇺</SelectItem>
                          <SelectItem value="CNY">CNY 🇨🇳</SelectItem>
                          <SelectItem value="BYN">BYN 🇧🇾</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Сумма (макс. 100,000)</Label>
                      <Input 
                        type="number"
                        placeholder="0.00"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        max={100000}
                      />
                    </div>
                    <Button onClick={handleDeposit} className="w-full">
                      <Icon name="Plus" className="mr-2" size={18} />
                      Пополнить
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="transfer" className="mt-6">
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <Icon name="Send" className="mr-2" size={20} />
                    Перевод криптовалюты
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Криптовалюта</Label>
                      <Select value={transferCrypto} onValueChange={setTransferCrypto}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {cryptos.map(c => (
                            <SelectItem key={c.id} value={c.symbol}>
                              {c.symbol} (Баланс: {c.balance.toFixed(4)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Количество</Label>
                      <Input 
                        type="number"
                        step="0.0001"
                        placeholder="0.00"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>ID игрока или ID кошелька</Label>
                      <Input 
                        placeholder="USR123 или WALLET456"
                        value={transferRecipient}
                        onChange={(e) => setTransferRecipient(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleTransfer} className="w-full">
                      <Icon name="ArrowRight" className="mr-2" size={18} />
                      Отправить
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="shop" className="mt-6">
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <Icon name="ShoppingCart" className="mr-2" size={20} />
                    Магазин криптовалют
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Криптовалюта</Label>
                      <Select value={shopCrypto} onValueChange={setShopCrypto}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {cryptos.map(c => (
                            <SelectItem key={c.id} value={c.symbol}>
                              {c.name} ({c.symbol}) - ${c.price.toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Количество</Label>
                      <Input 
                        type="number"
                        step="0.0001"
                        placeholder="0.00"
                        value={shopAmount}
                        onChange={(e) => setShopAmount(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Ваш ID кошелька</Label>
                      <Input 
                        placeholder={currentUser?.walletId}
                        value={shopWalletId}
                        onChange={(e) => setShopWalletId(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Ваш ID: {currentUser?.walletId}
                      </p>
                    </div>
                    <Button onClick={handleShopPurchase} className="w-full bg-accent hover:bg-accent/90 text-black">
                      <Icon name="ShoppingBag" className="mr-2" size={18} />
                      Купить
                    </Button>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
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
                <p className="text-sm text-muted-foreground mb-4">+10% к профиту на всех сделках</p>
                
                <div className="space-y-3 mb-4">
                  <Label>Валюта оплаты</Label>
                  <Select value={premiumCurrency} onValueChange={(v) => setPremiumCurrency(v as keyof Wallet)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - ${PREMIUM_PRICES.USD}</SelectItem>
                      <SelectItem value="RUB">RUB - ₽{PREMIUM_PRICES.RUB}</SelectItem>
                      <SelectItem value="EUR">EUR - €{PREMIUM_PRICES.EUR}</SelectItem>
                      <SelectItem value="CNY">CNY - ¥{PREMIUM_PRICES.CNY}</SelectItem>
                      <SelectItem value="BYN">BYN - Br{PREMIUM_PRICES.BYN}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={handleBuyPremium} className="w-full bg-accent hover:bg-accent/90 text-black neon-glow-blue">
                  Купить за {premiumCurrency} {PREMIUM_PRICES[premiumCurrency]}
                </Button>
              </Card>
            )}

            <Card className="p-6 border-2 border-primary/20">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Icon name="Gift" className="mr-2" size={20} />
                Промокоды
              </h3>
              
              <Tabs defaultValue="use" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="use">Использовать</TabsTrigger>
                  <TabsTrigger value="create">Создать</TabsTrigger>
                </TabsList>

                <TabsContent value="use" className="space-y-3">
                  <Input 
                    placeholder="Введите промокод"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  />
                  <Button onClick={handleUsePromo} className="w-full" variant="outline">
                    Активировать
                  </Button>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Доступные промокоды:</p>
                    {myPromoCodes.filter(p => !p.used).map((promo, i) => (
                      <div key={i} className="text-xs bg-muted p-2 rounded flex justify-between">
                        <span className="font-mono">{promo.code}</span>
                        <span>{promo.bonus} {promo.type}</span>
                      </div>
                    ))}
                  </div>
                  {usedPromoCodes.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground">Использованные:</p>
                        {usedPromoCodes.map((promo, i) => (
                          <div key={i} className="text-xs bg-muted/50 p-2 rounded flex justify-between opacity-50">
                            <span className="font-mono line-through">{promo.code}</span>
                            <span>{promo.bonus} {promo.type}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="create" className="space-y-3">
                  <div>
                    <Label>Код промокода</Label>
                    <Input 
                      placeholder="MYPROMO"
                      value={newPromoCode}
                      onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                    />
                  </div>
                  <div>
                    <Label>Бонус</Label>
                    <Input 
                      type="number"
                      placeholder="100"
                      value={newPromoBonus}
                      onChange={(e) => setNewPromoBonus(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Тип валюты</Label>
                    <Select value={newPromoType} onValueChange={setNewPromoType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="RUB">RUB</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USDT">USDT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreatePromo} className="w-full">
                    <Icon name="Plus" className="mr-2" size={18} />
                    Создать (комиссия 1.5%)
                  </Button>
                  {newPromoBonus && (
                    <p className="text-xs text-center text-muted-foreground">
                      Комиссия: ${(parseFloat(newPromoBonus) * 0.015).toFixed(2)}
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </Card>

            <Card className="p-6 border-2 border-destructive/20">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Icon name="Receipt" className="mr-2" size={20} />
                Налоги
              </h3>
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded">
                  <p className="text-sm text-muted-foreground">К оплате:</p>
                  <p className="text-2xl font-bold text-destructive">
                    ${currentUser?.taxOwed.toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label>Валюта оплаты</Label>
                  <Select value={taxPaymentCurrency} onValueChange={(v) => setTaxPaymentCurrency(v as keyof Wallet)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="RUB">RUB</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="CNY">CNY</SelectItem>
                      <SelectItem value="BYN">BYN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Сумма</Label>
                  <Input 
                    type="number"
                    placeholder="0.00"
                    value={taxPaymentAmount}
                    onChange={(e) => setTaxPaymentAmount(e.target.value)}
                  />
                </div>
                <Button onClick={handlePayTax} variant="destructive" className="w-full">
                  <Icon name="DollarSign" className="mr-2" size={18} />
                  Оплатить комиссию
                </Button>
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

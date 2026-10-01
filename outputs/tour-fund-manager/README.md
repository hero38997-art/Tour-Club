# বন্ধু ফান্ড · Friend Group Fund Manager

বন্ধুদের গ্রুপের মাসিক জমা, খরচ, দেনা-পাওনা, নোটিশ এবং ভ্রমণ নিয়ে ভোট করার responsive ওয়েব অ্যাপ। UI বাংলা + English; ফোন ও কম্পিউটার দুই জায়গাতেই ব্যবহারযোগ্য।

## ফিচার

- প্রথমবার `/setup` থেকে একমাত্র Admin তৈরি; পরে Admin ও Member username/password দিয়ে লগইন করবে। Password bcrypt দিয়ে hash হয়, session ৭ দিনের httpOnly JWT cookie।
- Admin বন্ধু যোগ/সম্পাদনা/মুছতে এবং সদস্যের username ও অস্থায়ী password নির্ধারণ করতে পারবেন। Member শুধু নিজের জমার entry যোগ করতে পারবেন।
- Dashboard-এ মোট জমা, মোট খরচ, ব্যালেন্স, ৬ মাসের জমা বনাম খরচ চার্ট ও নিজের হিসাব।
- Admin জমা/খরচ/নোটিশ পরিচালনা করবেন; গ্রুপের সদস্যরা গ্রুপের হিসাব দেখতে পারবেন।
- Settlement পেজে প্রতিটি সদস্যের জমা এবং তার দেওয়া খরচ থেকে কম লেনদেনে দেনা-পাওনার প্রস্তাব তৈরি হয়।
- Admin ২–৫টি অপশন, একক/একাধিক পছন্দ, deadline এবং গোপন/নামসহ ভোটের poll তৈরি করতে পারবেন। Member deadline-এর আগে ভোট বদলাতে পারবেন। ফলাফল live গণনা হয়; গোপন ভোটে শুধু Admin ভোটারের পরিচয় দেখেন।
- Deadline পেরুলে API ভোট বন্ধ হিসেবে গণ্য করে; Admin চাইলে আগেই poll বন্ধ করতে পারবেন।
- Dark mode, empty/loading/error state, responsive sidebar এবং lucide-react icon। কোনো ছবি আপলোড নেই।

## ১. লোকাল সেটআপ

প্রয়োজন: Node.js 18.17 বা পরের 18.x/20.x release এবং npm।

```bash
npm install
```

`.env.example` কপি করে `.env.local` বানান; MongoDB connection string ও আলাদা দীর্ঘ random `JWT_SECRET` বসান। Secret কখনো GitHub-এ commit করবেন না। তারপর:

```bash
npm run dev
```

`http://localhost:3000` খুলুন। প্রথমবার `/setup`-এ Admin তৈরি হবে। এরপর `/login` থেকে প্রবেশ করুন। Admin-এর মাধ্যমে সর্বোচ্চ ১০ জনসহ প্রয়োজনীয় সদস্য যোগ করুন; প্রত্যেককে আলাদা username/password দিন। নিরাপত্তার জন্য প্রথম লগইনের পর অস্থায়ী password আলাদা পথে পৌঁছে দিন।

## ২. MongoDB Atlas Free cluster

1. [MongoDB Atlas](https://www.mongodb.com/atlas) অ্যাকাউন্ট খুলে একটি project ও free-tier cluster তৈরি করুন। Cloud provider/region নির্বাচন করুন। Atlas-এর free-tier availability ও সীমা অঞ্চল/সময়ের সঙ্গে বদলাতে পারে; Atlas console-এ বর্তমান শর্ত দেখুন।
2. **Database Access**-এ সীমিত-ক্ষমতার database user তৈরি করে শক্ত password দিন। এটি আপনার Atlas account password নয়।
3. **Network Access**-এ চালানোর পরিবেশের IP allowlist করুন। Local development-এর জন্য নিজের বর্তমান IP দিন; production-এ Vercel-এর outbound IP policy অনুযায়ী সেট করুন। সব IP `0.0.0.0/0` allow করা এড়িয়ে চলুন।
4. **Connect → Drivers** থেকে connection string নিন। `<password>` এবং database name বসিয়ে `MONGODB_URI` হিসেবে রাখুন, যেমন:

   `mongodb+srv://dbuser:YOUR_PASSWORD@cluster.example.mongodb.net/friend-fund?retryWrites=true&w=majority`

   Password-এ `@`, `:` বা `/` থাকলে URI encoding করুন। Database-টি চালু হওয়ার পর Mongoose প্রয়োজনীয় collections ও indexes তৈরি করবে।

## ৩. Vercel-এ deploy

1. এই GitHub repository Vercel-এ import করুন এবং Root Directory-তে `outputs/tour-fund-manager` দিন। Framework preset Next.js স্বয়ংক্রিয়ভাবে শনাক্ত হওয়ার কথা। Build command `npm run build`; install command `npm install`।
2. Vercel Project → **Settings → Environment Variables**-এ `MONGODB_URI` ও `JWT_SECRET` দিন। Preview ও Production environment আলাদা করে নির্ধারণ করুন। `JWT_SECRET` কমপক্ষে ৩২ অক্ষরের random value হবে। `.env.local` বা secret GitHub-এ দেবেন না।
3. Atlas **Network Access**-এ Vercel server থেকে সংযোগ অনুমোদিত আছে নিশ্চিত করুন। Vercel-এর serverless deployment-এর জন্য Atlas-এর বর্তমান network connectivity নির্দেশনা অনুসরণ করুন।
4. Deploy করুন। `/setup` খুলে একবার Admin তৈরি করুন। Production Admin credential নিরাপদে সংরক্ষণ করুন।
5. Environment variable বদলালে Vercel-এ নতুন deployment দিন। Domain যোগ করলে HTTPS সক্রিয় আছে নিশ্চিত করুন।

## API ও ফোল্ডার

- `app/api/auth/*`: setup, login, logout, current session
- `app/api/[resource]/*`: members, deposits, expenses, settlements, notices, polls-এর role-checked CRUD
- `app/api/votes`: ভোট জমা/পরিবর্তন; `app/api/polls/[id]`: poll result ও ভোটার visibility
- `models/`: MongoDB collections; `lib/`: database, auth, money এবং settlement calculation
- `components/`: বাংলা UI, charts, forms, reusable resource screens
- `middleware.js`: JWT cookie ছাড়া dashboard page-এ যাওয়া আটকায়; API নিজেও server-side authorization যাচাই করে

## নিরাপত্তা নোট

- `.env.local` commit করবেন না; `.gitignore`-এ env files বাদ দেওয়া আছে।
- Public repository-তে বাস্তব member-এর ফোন নম্বর বা ব্যক্তিগত তথ্য seed করবেন না।
- Group data private রাখতে GitHub source code public হলেও app-টি Vercel-এ deploy করার পর অ্যাকাউন্টের password নিরাপদে বিতরণ করুন।
- এই starter-এ password reset/email verification নেই। ভুলে গেলে MongoDB-তে admin/member credential নিজে reset করতে হবে।
- Free hosting/database-এ usage cap বা policy পরিবর্তিত হতে পারে; Vercel ও Atlas dashboard-এ ব্যবহার পর্যবেক্ষণ করুন।

## License

ব্যক্তিগত/বন্ধুদের গ্রুপ ব্যবহারের জন্য প্রকাশিত।

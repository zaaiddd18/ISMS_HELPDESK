--
-- PostgreSQL database dump
--

\restrict givo7gP7fVp4hjvLX8VVE6k0qGA5fSvOAeAJWmg3UTOhdwwdFKeAyUoW5eXRErK

-- Dumped from database version 18.3 (Homebrew)
-- Dumped by pg_dump version 18.3 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (role_id, role_name) FROM stdin;
1	Employee
2	Manager
3	Admin
4	Contractor
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employees (cpf, name, designation, mobile_no, email, is_active, role_id, financial_year, created_at) FROM stdin;
39777	Rajesh Bansal	Senior Engineer	9860869935	rajesh.bansal45@ongc.co.in	t	1	2025-26	2026-07-12 19:52:58.359036
58038	Yogesh Kapoor	Deputy Manager - IT	9351471921	yogesh.kapoor88@ongc.co.in	t	2	2025-26	2026-07-12 19:52:58.359036
80463	Rahul Rana	Chief Manager	9350708676	rahul.rana73@ongc.co.in	t	1	2025-26	2026-07-12 19:52:58.359036
37549	Manoj Kapoor	Manager - Drilling	9733113909	manoj.kapoor76@ongc.co.in	t	4	2025-26	2026-07-12 19:52:58.359036
96528	Sunita Ganguly	Manager - Production	9777474379	sunita.ganguly50@ongc.co.in	f	4	2025-26	2026-07-12 19:52:58.359036
87943	Priya Subramaniam	Deputy Manager - Finance	9313338776	priya.subramaniam47@ongc.co.in	t	1	2025-26	2026-07-12 19:52:58.359036
74346	Arjun Rathore	Senior Engineer	9530729868	arjun.rathore85@ongc.co.in	t	1	2025-26	2026-07-12 19:52:58.359036
97820	Kiran Chauhan	Deputy Manager - Finance	9295798980	kiran.chauhan35@ongc.co.in	t	2	2025-26	2026-07-12 19:52:58.359036
41864	Seema Shah	Chief Chemist	9110058758	seema.shah72@ongc.co.in	t	1	2025-26	2026-07-12 19:52:58.359036
65308	Deepak Sethi	Manager - Production	9582544805	deepak.sethi47@ongc.co.in	t	3	2025-26	2026-07-12 19:52:58.359036
29681	Dinesh Sengupta	Chief Manager	9231343735	dinesh.sengupta97@ongc.co.in	t	3	2025-26	2026-07-12 19:52:58.359036
33080	Manisha Rao	Senior Engineer	9951641268	manisha.rao59@ongc.co.in	t	3	2025-26	2026-07-12 19:52:58.359036
67826	Geeta Verma	Assistant Manager - HR	9440733816	geeta.verma10@ongc.co.in	t	2	2025-26	2026-07-12 19:52:58.359036
16051	Yogesh Shah	Senior Superintendent	9477650159	yogesh.shah77@ongc.co.in	t	1	2025-26	2026-07-12 19:52:58.359036
66820	Arjun Bhatt	Assistant Geologist	9698278468	arjun.bhatt69@ongc.co.in	t	3	2025-26	2026-07-12 19:52:58.359036
86672	Manisha Thakur	General Manager	9125497741	manisha.thakur85@ongc.co.in	t	1	2025-26	2026-07-12 19:52:58.359036
53037	Ramesh Bose	General Manager	9345146714	ramesh.bose56@ongc.co.in	t	1	2025-26	2026-07-12 19:52:58.359036
85350	Kiran Das	Deputy Manager - IT	9238717159	kiran.das16@ongc.co.in	t	4	2025-26	2026-07-12 19:52:58.359036
28887	Sunita Verma	Chief Chemist	9714363322	sunita.verma56@ongc.co.in	t	3	2025-26	2026-07-12 19:52:58.359036
45464	Deepika Das	Chief Chemist	9803998424	deepika.das63@ongc.co.in	t	4	2025-26	2026-07-12 19:52:58.359036
17288	Anita Ganguly	Senior Superintendent	9797426774	anita.ganguly68@ongc.co.in	f	4	2025-26	2026-07-12 19:52:58.359036
84880	Deepika Menon	Deputy Manager - IT	9841786530	deepika.menon27@ongc.co.in	t	2	2025-26	2026-07-12 19:52:58.359036
63558	Rekha Gupta	Deputy Manager - Finance	9934304270	rekha.gupta76@ongc.co.in	t	1	2025-26	2026-07-12 19:52:58.359036
19752	Divya Bhatt	Executive Engineer	9644263479	divya.bhatt3@ongc.co.in	f	1	2025-26	2026-07-12 19:52:58.359036
78830	Deepika Arora	Superintending Engineer	9177183917	deepika.arora22@ongc.co.in	t	4	2025-26	2026-07-12 19:52:58.359036
32072	Priya Sengupta	Assistant Engineer	9499121266	priya.sengupta81@ongc.co.in	t	3	2025-26	2026-07-12 19:52:58.359036
74492	Anjali Reddy	Senior Superintendent	9592361714	anjali.reddy26@ongc.co.in	t	3	2025-26	2026-07-12 19:52:58.359036
17379	Ashok Rana	Senior Engineer	9211414151	ashok.rana28@ongc.co.in	f	1	2025-26	2026-07-12 19:52:58.359036
71002	Swati Nair	Deputy General Manager	9572886848	swati.nair31@ongc.co.in	t	1	2025-26	2026-07-12 19:52:58.359036
72275	Yogesh Rana	Deputy Manager - IT	9127761537	yogesh.rana86@ongc.co.in	t	4	2025-26	2026-07-12 19:52:58.359036
77171	Anil Chauhan	Senior Technical Assistant	9379161293	anil.chauhan42@ongc.co.in	f	4	2025-26	2026-07-12 19:52:58.359036
61406	Shweta Rana	Assistant Geologist	9546466066	shweta.rana85@ongc.co.in	t	3	2025-26	2026-07-12 19:52:58.359036
32218	Ajay Mishra	Senior Superintendent	9468859895	ajay.mishra49@ongc.co.in	t	1	2025-26	2026-07-12 19:52:58.359036
70890	Kavita Gupta	General Manager	9936081656	kavita.gupta84@ongc.co.in	t	3	2025-26	2026-07-12 19:52:58.359036
42920	Manoj Saxena	Deputy General Manager	9442267483	manoj.saxena91@ongc.co.in	t	1	2025-26	2026-07-12 19:52:58.359036
23998	Naveen Rao	Manager - Production	9377700289	naveen.rao29@ongc.co.in	t	4	2025-26	2026-07-12 19:52:58.359036
23009	Arjun Singh	Assistant Geologist	9893838088	arjun.singh94@ongc.co.in	t	1	2025-26	2026-07-12 19:52:58.359036
38059	Manoj Sharma	Executive Engineer	9641455265	manoj.sharma69@ongc.co.in	t	3	2025-26	2026-07-12 19:52:58.359036
86820	Vandana Dubey	Junior Engineer	9477782079	vandana.dubey48@ongc.co.in	t	1	2025-26	2026-07-12 19:52:58.359036
96140	Anupama Malhotra	Deputy Manager - IT	9738680495	anupama.malhotra45@ongc.co.in	t	4	2025-26	2026-07-12 19:52:58.359036
56096	Naveen Singh	Chief Chemist	9487236902	naveen.singh87@ongc.co.in	t	1	2025-26	2026-07-12 19:52:58.359036
47345	Geeta Subramaniam	Chief Chemist	9329570747	geeta.subramaniam11@ongc.co.in	t	2	2025-26	2026-07-12 19:52:58.359036
85761	Prakash Mukherjee	Senior Superintendent	9703339050	prakash.mukherjee63@ongc.co.in	t	4	2025-26	2026-07-12 19:52:58.359036
98980	Ravi Subramaniam	Deputy General Manager	9300752445	ravi.subramaniam65@ongc.co.in	t	1	2025-26	2026-07-12 19:52:58.359036
38818	Suresh Pandey	Manager - Production	9836384718	suresh.pandey69@ongc.co.in	t	2	2025-26	2026-07-12 19:52:58.359036
65028	Swati Agarwal	Executive Engineer	9240587555	swati.agarwal65@ongc.co.in	t	1	2025-26	2026-07-12 19:52:58.359036
75316	Vandana Chatterjee	Assistant Manager - HR	9144746213	vandana.chatterjee68@ongc.co.in	f	4	2025-26	2026-07-12 19:52:58.359036
62471	Rekha Shah	Manager - Drilling	9149076473	rekha.shah35@ongc.co.in	t	1	2025-26	2026-07-12 19:52:58.359036
85048	Anita Chatterjee	Chief Chemist	9426594694	anita.chatterjee32@ongc.co.in	t	4	2025-26	2026-07-12 19:52:58.359036
97431	Suresh Malhotra	Manager - Production	9790476050	suresh.malhotra35@ongc.co.in	t	1	2024-25	2026-07-13 10:50:35.951584
18620	Gaurav Joshi	Assistant Engineer	9846430394	gaurav.joshi8@ongc.co.in	t	1	2024-25	2026-07-13 10:50:35.951584
47995	Kiran Chatterjee	Senior Engineer	9499968385	kiran.chatterjee35@ongc.co.in	t	4	2024-25	2026-07-13 10:50:35.951584
90811	Priya Bansal	Deputy Manager - Finance	9689883764	priya.bansal17@ongc.co.in	t	1	2024-25	2026-07-13 10:50:35.951584
36112	Kavya Prasad	Chief Manager	9222837051	kavya.prasad7@ongc.co.in	t	1	2024-25	2026-07-13 10:50:35.951584
54165	Yogesh Tiwari	Senior Technical Assistant	9718614867	yogesh.tiwari66@ongc.co.in	f	2	2024-25	2026-07-13 10:50:35.951584
30032	Meera Mukherjee	Senior Engineer	9647023940	meera.mukherjee94@ongc.co.in	t	4	2024-25	2026-07-13 10:50:35.951584
17452	Anjali Rao	Assistant Manager - HR	9384263373	anjali.rao13@ongc.co.in	t	4	2024-25	2026-07-13 10:50:35.951584
94839	Kavya Chopra	Deputy Manager - IT	9148138438	kavya.chopra30@ongc.co.in	t	4	2024-25	2026-07-13 10:50:35.951584
20252	Preeti Arora	Manager - Drilling	9562840593	preeti.arora47@ongc.co.in	t	2	2024-25	2026-07-13 10:50:35.951584
92791	Pooja Naidu	Senior Technical Assistant	9748352828	pooja.naidu59@ongc.co.in	t	4	2024-25	2026-07-13 10:50:35.951584
72522	Yogesh Sethi	Assistant Engineer	9831682366	yogesh.sethi84@ongc.co.in	f	2	2024-25	2026-07-13 10:50:35.951584
18177	Ramesh Sinha	Senior Technical Assistant	9646550783	ramesh.sinha21@ongc.co.in	f	3	2024-25	2026-07-13 10:50:35.951584
45437	Neha Ahluwalia	Deputy General Manager	9886710772	neha.ahluwalia87@ongc.co.in	t	3	2024-25	2026-07-13 10:50:35.951584
73640	Prakash Chatterjee	Junior Engineer	9831208772	prakash.chatterjee40@ongc.co.in	t	1	2024-25	2026-07-13 10:50:35.951584
35167	Vikram Nair	Assistant Engineer	9832146676	vikram.nair36@ongc.co.in	t	3	2024-25	2026-07-13 10:50:35.951584
50641	Amit Chopra	Deputy Manager - IT	9970440981	amit.chopra44@ongc.co.in	t	4	2024-25	2026-07-13 10:50:35.951584
36524	Neha Khanna	Executive Engineer	9170177693	neha.khanna16@ongc.co.in	t	1	2024-25	2026-07-13 10:50:35.951584
29368	Amit Dubey	Manager - Drilling	9898009696	amit.dubey3@ongc.co.in	t	1	2024-25	2026-07-13 10:50:35.951584
63632	Anupama Ganguly	Manager - Drilling	9510106497	anupama.ganguly40@ongc.co.in	t	1	2024-25	2026-07-13 10:50:35.951584
42286	Sanjay Rana	Deputy Manager - IT	9109141449	sanjay.rana21@ongc.co.in	t	3	2024-25	2026-07-13 10:50:35.951584
92642	Naveen Bhatia	Deputy Manager - Finance	9474359238	naveen.bhatia2@ongc.co.in	t	1	2024-25	2026-07-13 10:50:35.951584
22611	Sonia Iyer	Manager - Production	9507661567	sonia.iyer40@ongc.co.in	f	3	2024-25	2026-07-13 10:50:35.951584
79444	Vinod Singh	General Manager	9421584224	vinod.singh90@ongc.co.in	t	3	2024-25	2026-07-13 10:50:35.951584
82807	Geeta Gupta	Executive Engineer	9999720544	geeta.gupta13@ongc.co.in	t	1	2024-25	2026-07-13 10:50:35.951584
43910	Naveen Trivedi	Junior Engineer	9860347916	naveen.trivedi40@ongc.co.in	t	1	2024-25	2026-07-13 10:50:35.951584
87453	Sunita Naidu	General Manager	9536342222	sunita.naidu37@ongc.co.in	t	2	2024-25	2026-07-13 10:50:35.951584
12397	Rajesh Reddy	Manager - Production	9728298979	rajesh.reddy58@ongc.co.in	t	3	2024-25	2026-07-13 10:50:35.951584
40444	Deepak Kumar	Deputy General Manager	9192532975	deepak.kumar23@ongc.co.in	t	2	2024-25	2026-07-13 10:50:35.951584
20594	Rajesh Rathore	Assistant Engineer	9962272402	rajesh.rathore63@ongc.co.in	t	1	2024-25	2026-07-13 10:50:35.951584
97335	Suresh Shah	Chief Manager	9764629572	suresh.shah32@ongc.co.in	t	1	2024-25	2026-07-13 10:50:35.951584
77179	Rekha Yadav	Deputy General Manager	9251214056	rekha.yadav43@ongc.co.in	t	1	2024-25	2026-07-13 10:50:35.951584
47902	Sunita Patel	Assistant Engineer	9875881390	sunita.patel71@ongc.co.in	t	4	2024-25	2026-07-13 10:50:35.951584
98328	Sonia Trivedi	Senior Superintendent	9838866312	sonia.trivedi96@ongc.co.in	t	4	2024-25	2026-07-13 10:50:35.951584
13361	Vandana Patel	Junior Engineer	9295354037	vandana.patel9@ongc.co.in	t	1	2024-25	2026-07-13 10:50:35.951584
51494	Vijay Chatterjee	Manager - Drilling	9599035650	vijay.chatterjee14@ongc.co.in	t	1	2024-25	2026-07-13 10:50:35.951584
81073	Seema Thakur	Manager - Drilling	9664176411	seema.thakur74@ongc.co.in	t	2	2024-25	2026-07-13 10:50:35.951584
27900	Kavya Verma	Senior Superintendent	9279882272	kavya.verma38@ongc.co.in	t	3	2024-25	2026-07-13 10:50:35.951584
40632	Rekha Naidu	Assistant Engineer	9909944695	rekha.naidu9@ongc.co.in	t	3	2024-25	2026-07-13 10:50:35.951584
63504	Ritu Das	Senior Technical Assistant	9280499234	ritu.das86@ongc.co.in	f	2	2024-25	2026-07-13 10:50:35.951584
49677	Seema Mukherjee	Deputy General Manager	9593488073	seema.mukherjee36@ongc.co.in	t	1	2024-25	2026-07-13 10:50:35.951584
28063	Sandeep Khanna	Chief Chemist	9644896444	sandeep.khanna26@ongc.co.in	t	3	2024-25	2026-07-13 10:50:35.951584
49934	Arjun Patel	Executive Engineer	9268485101	arjun.patel27@ongc.co.in	t	4	2024-25	2026-07-13 10:50:35.951584
73603	Suresh Verma	Senior Superintendent	9249353297	suresh.verma94@ongc.co.in	t	1	2024-25	2026-07-13 10:50:35.951584
77287	Deepika Malhotra	Senior Engineer	9750671707	deepika.malhotra49@ongc.co.in	t	1	2024-25	2026-07-13 10:50:35.951584
44853	Kavya Agarwal	Senior Technical Assistant	9717719188	kavya.agarwal6@ongc.co.in	t	2	2024-25	2026-07-13 10:50:35.951584
50782	Sunita Subramaniam	Executive Engineer	9909873647	sunita.subramaniam82@ongc.co.in	t	3	2024-25	2026-07-13 10:50:35.951584
34977	Rakesh Sengupta	Senior Technical Assistant	9409238308	rakesh.sengupta13@ongc.co.in	t	1	2024-25	2026-07-13 10:50:35.951584
44014	Neha Joshi	Executive Engineer	9706986187	neha.joshi39@ongc.co.in	t	3	2024-25	2026-07-13 10:50:35.951584
90666	Pooja Ganguly	Manager - Production	9461243213	pooja.ganguly17@ongc.co.in	t	2	2024-25	2026-07-13 10:50:35.951584
12697	Amit Dubey	Manager - Production	9884306837	amit.dubey58@ongc.co.in	t	2	2025-26	2026-07-12 19:52:58.359036
\.


--
-- Name: roles_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_role_id_seq', 4, true);


--
-- PostgreSQL database dump complete
--

\unrestrict givo7gP7fVp4hjvLX8VVE6k0qGA5fSvOAeAJWmg3UTOhdwwdFKeAyUoW5eXRErK


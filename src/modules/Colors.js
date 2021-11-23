const gradientColors = { 
	0: [
		"rgb(192,37,130)", 
		"rgb(63,104,172)", 
		"rgb(219,194,103)"
	],
	1: [
		"rgb(47,67,82)", 
		"rgb(177,37,61)", 
		"rgb(194,4,124)"
	],
	2: [
		"rgb(165,172,149)", 
		"rgb(186,115,70)", 
		"rgb(56,25,99)"
	],
	3: [
		"rgb(122,207,178)", 
		"rgb(89,0,204)", 
		"rgb(195,120,96)"
	],
	4: [
		"rgb(124,25,215)", 
		"rgb(198,204,177)", 
		"rgb(169,31,116)"
	],
	5: [
		"rgb(132,35,173)", 
		"rgb(57,174,153)", 
		"rgb(20,205,212)"
	],
	6: [
		"rgb(143,38,193)", 
		"rgb(17,72,190)", 
		"rgb(216,180,200)"
	],
	7: [
		"rgb(52,208,160)", 
		"rgb(158,33,122)", 
		"rgb(50,203,197)"
	],
	8: [
		"rgb(117,61,98)", 
		"rgb(101,57,115)", 
		"rgb(73,118,103)"
	],
	9: [
		"rgb(189,42,117)", 
		"rgb(218,68,6)", 
		"rgb(117,29,30)"
	],
	10: [
		"rgb(174,71,80)", 
		"rgb(118,95,160)", 
		"rgb(178,119,166)"
	],
	11: [
		"rgb(4,16,28)", 
		"rgb(74,52,75)", 
		"rgb(16,140,176)"
	],
	12: [
		"rgb(124,24,10)", 
		"rgb(23,31,126)", 
		"rgb(201,109,122)"
	],
	13: [
		"rgb(182,200,70)", 
		"rgb(218,57,168)", 
		"rgb(61,16,210)"
	],
	14: [
		"rgb(132,28,69)", 
		"rgb(8,7,78)", 
		"rgb(89,41,155)"
	],
	15: [
		"rgb(48,40,3)", 
		"rgb(95,17,128)", 
		"rgb(117,87,199)"
	],
	16: [
		"rgb(217,181,66)", 
		"rgb(88,21,192)", 
		"rgb(215,61,14)"
	],
	17: [
		"rgb(42,32,182)", 
		"rgb(211,156,192)", 
		"rgb(198,72,102)"
	],
	18: [
		"rgb(40,89,193)", 
		"rgb(112,63,140)", 
		"rgb(216,213,171)"
	],
	19: [
		"rgb(109,152,74)", 
		"rgb(114,29,25)", 
		"rgb(218,151,43)"
	],
	20: [
		"rgb(132,60,23)", 
		"rgb(96,4,172)", 
		"rgb(200,60,4)"
	],
	21: [
		"rgb(16,110,216)", 
		"rgb(28,3,31)", 
		"rgb(13,166,140)"
	],
	22: [
		"rgb(207,66,172)", 
		"rgb(116,213,156)", 
		"rgb(39,24,132)"
	],
	23: [
		"rgb(144,120,184)", 
		"rgb(5,23,115)", 
		"rgb(207,102,105)"
	],
	24: [
		"rgb(200,89,210)", 
		"rgb(101,83,89)", 
		"rgb(35,24,64)"
	],
	25: [
		"rgb(134,206,69)", 
		"rgb(105,6,65)", 
		"rgb(115,187,152)"
	],
	26: [
		"rgb(202,212,199)", 
		"rgb(158,193,187)", 
		"rgb(22,202,239)"
	],
	27: [
		"rgb(188,130,25)", 
		"rgb(8,189,71)", 
		"rgb(117,88,98)"
	],
	28: [
		"rgb(147,102,209)", 
		"rgb(33,77,76)", 
		"rgb(126,200,153)"
	],
	29: [
		"rgb(3,113,167)", 
		"rgb(87,142,171)", 
		"rgb(158,41,25)"
	],
	30: [
		"rgb(161,37,217)", 
		"rgb(65,4,39)", 
		"rgb(177,145,193)"
	],
	31: [
		"rgb(30,179,166)", 
		"rgb(195,120,112)", 
		"rgb(160,8,33)"
	],
	32: [
		"rgb(124,143,146)", 
		"rgb(211,180,173)", 
		"rgb(91,28,56)"
	],
	33: [
		"rgb(55,102,108)", 
		"rgb(104,19,56)", 
		"rgb(175,66,55)"
	],
	34: [
		"rgb(77,108,214)", 
		"rgb(212,86,219)", 
		"rgb(193,128,63)"
	],
	35: [
		"rgb(182,32,63)", 
		"rgb(110,26,32)", 
		"rgb(165,26,56)"
	],
	36: [
		"rgb(29,54,22)", 
		"rgb(97,103,123)", 
		"rgb(191,119,124)"
	],
	37: [
		"rgb(197,116,16)", 
		"rgb(141,41,200)", 
		"rgb(102,31,140)"
	],
	38: [
		"rgb(28,122,73)", 
		"rgb(184,182,61)", 
		"rgb(83,189,47)"
	],
	39: [
		"rgb(107,10,99)", 
		"rgb(1,185,171)", 
		"rgb(66,201,201)"
	],
	40: [
		"rgb(198,36,147)", 
		"rgb(108,192,183)", 
		"rgb(220,145,206)"
	],
	41: [
		"rgb(139,119,104)", 
		"rgb(43,24,68)", 
		"rgb(202,161,180)"
	],
	42: [
		"rgb(41,69,42)", 
		"rgb(208,187,171)", 
		"rgb(104,104,99)"
	],
	43: [
		"rgb(154,0,39)", 
		"rgb(158,178,174)", 
		"rgb(83,1,35)"
	],
	44: [
		"rgb(118,24,67)", 
		"rgb(210,25,99)", 
		"rgb(46,9,94)"
	],
	45: [
		"rgb(73,15,63)", 
		"rgb(27,28,151)", 
		"rgb(2,183,120)"
	],
	46: [
		"rgb(170,204,189)", 
		"rgb(10,105,27)", 
		"rgb(2,93,142)"
	],
	47: [
		"rgb(40,88,96)", 
		"rgb(215,210,45)", 
		"rgb(190,66,68)"
	],
	48: [
		"rgb(154,130,80)", 
		"rgb(204,13,100)", 
		"rgb(57,21,87)"
	],
	49: [
		"rgb(136,48,181)", 
		"rgb(107,116,219)", 
		"rgb(63,18,97)"
	],
	50: [
		"rgb(187,190,203)", 
		"rgb(29,30,37)", 
		"rgb(139,220,205)"
	],
	51: [
		"rgb(95,73,208)", 
		"rgb(1,8,24)", 
		"rgb(184,140,219)"
	],
	52: [
		"rgb(83,31,201)", 
		"rgb(220,80,52)", 
		"rgb(53,8,93)"
	],
	53: [
		"rgb(139,45,31)", 
		"rgb(31,7,14)", 
		"rgb(195,18,38)"
	],
	54: [
		"rgb(153,207,176)", 
		"rgb(155,108,69)", 
		"rgb(69,51,156)"
	],
	55: [
		"rgb(22,146,80)", 
		"rgb(45,26,125)", 
		"rgb(32,20,154)"
	],
	56: [
		"rgb(63,59,28)", 
		"rgb(39,1,12)", 
		"rgb(139,130,90)"
	],
	57: [
		"rgb(4,211,145)", 
		"rgb(121,11,12)", 
		"rgb(220,168,101)"
	],
	58: [
		"rgb(185,192,155)", 
		"rgb(199,53,11)", 
		"rgb(190,37,37)"
	],
	59: [
		"rgb(31,12,152)", 
		"rgb(23,0,48)", 
		"rgb(205,18,125)"
	],
	60: [
		"rgb(19,16,32)", 
		"rgb(177,38,55)", 
		"rgb(85,172,16)"
	],
	61: [
		"rgb(125,43,68)", 
		"rgb(63,7,124)", 
		"rgb(12,136,148)"
	],
	62: [
		"rgb(210,25,89)", 
		"rgb(22,76,162)", 
		"rgb(153,138,56)"
	],
	63: [
		"rgb(174,17,39)", 
		"rgb(138,121,131)", 
		"rgb(189,177,130)"
	]
};

module.exports = gradientColors;
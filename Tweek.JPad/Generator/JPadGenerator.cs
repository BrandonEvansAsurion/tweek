﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Engine.Drivers.Rules;
using Engine.Rules.Creation;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Tweek.JPad.Generator
{
    public class JPadGenerator
    {
        public static JPadGenerator New() => new JPadGenerator();

        private readonly RuleData[] _rules;

        private JPadGenerator(params RuleData[] rules)
        {
            _rules = rules;
        }

        public JPadGenerator AddSingleVariantRule(string matcher, string value, string ruleId = null)
            => AddRule(new RuleData()
                {
                    Id = ruleId ?? Guid.NewGuid().ToString(),
                    Matcher = JToken.Parse(matcher),
                    Value = value,
                    Type = "SingleVariant"
                });

        public JPadGenerator AddMultiVariantRule(string matcher, Dictionary<DateTimeOffset, string> valueDistrubtions, string ownerType, string ruleId = null)
            => AddRule(new RuleData()
            {
                Id = ruleId ?? Guid.NewGuid().ToString(),
                Matcher = matcher,
                ValueDistribution = valueDistrubtions.ToDictionary(x=>x.Key, x=>JToken.Parse(x.Value)),
                OwnerType = ownerType,
                Type = "MultiVariant"
            });
        
        private JPadGenerator AddRule(RuleData rule) => new JPadGenerator(_rules.Concat(new [] {rule}).ToArray());        

        public RuleDefinition Generate() => new RuleDefinition() { Format = "jpad", Payload = JsonConvert.SerializeObject(_rules, Formatting.Indented, new JsonSerializerSettings() {NullValueHandling = NullValueHandling.Ignore}) };
    }
}